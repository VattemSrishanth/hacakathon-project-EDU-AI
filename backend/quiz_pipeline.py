import time
import json
import base64
import io
import re
import concurrent.futures

try:
    import pypdf as PyPDF2
except ImportError:
    try:
        import PyPDF2
    except ImportError:
        PyPDF2 = None

import unified_llm

def _clean_text(text):
    """
    Cleans extracted text by removing excessive whitespaces and headers/footers artifacts.
    """
    if not text:
        return ""
    # Replace multiple newlines/spaces with single space
    cleaned = " ".join(text.split())
    # TODO: extensive header/footer removal logic could be added here
    # but simple whitespace collapsing is often sufficient for LLMs
    return cleaned

def _split_text_into_optimized_chunks(text, word_limit=2000, overlap_words=200):
    """
    Splits text into chunks of approximately `word_limit` words.
    """
    if not text:
        return []
        
    words = text.split()
    chunks = []
    current_idx = 0
    total_words = len(words)
    
    while current_idx < total_words:
        end_idx = min(current_idx + word_limit, total_words)
        
        # Adjust end_idx to finish on a sentence boundary if possible
        # (Looking for punctuation in the last 50 words of this chunk)
        if end_idx < total_words:
            lookback = 50
            search_slice = words[end_idx-lookback : end_idx]
            for i, w in enumerate(reversed(search_slice)):
                if w.endswith('.') or w.endswith('?') or w.endswith('!'):
                    end_idx = end_idx - i 
                    break
        
        chunk_words = words[current_idx:end_idx]
        chunks.append(" ".join(chunk_words))
        
        if end_idx >= total_words:
            break
            
        # Move forward, subtracting overlap
        current_idx = end_idx - overlap_words
        if current_idx < 0: current_idx = 0 # Safety
        
    return chunks

def _summarize_chunk(chunk_text, index, total):
    """
    Summarizes a single text chunk using the LLM.
    """
    prompt = (
        f"You are an expert educational content summarizer. Chunk {index+1} of {total}.\n"
        "TASK: Summarize the following text for a student lesson.\n"
        "RULES:\n"
        "1. Be concise but comprehensive.\n"
        "2. Keep key concepts, definitions, and facts.\n"
        "3. Ignore repetitive headers/footers.\n"
        "4. Tone: Neutral and educational.\n"
        "5. Output ONLY the summary text.\n\n"
        f"TEXT TO SUMMARIZE:\n{chunk_text}"
    )
    
    response, error = unified_llm.generate_text(prompt, temperature=0.3, max_output_tokens=1000)
    if error != "ok":
        print(f"[pipeline] Chunk {index+1} summarization failed: {error}")
        return ""
    return response

def _merge_summaries(summaries):
    """
    Merges multiple chunk summaries into one cohesive lesson summary.
    """
    if not summaries:
        return ""
        
    combined_text = "\n\n".join([s for s in summaries if s])
    
    if not combined_text:
        return ""

    prompt = (
        "TASK: Create a consolidated Lesson Summary from the following chunk summaries.\n"
        "RULES:\n"
        "1. Remove redundancies.\n"
        "2. Organize logically with clear sections.\n"
        "3. Ensure smooth flow between topics.\n"
        "4. This summary will be used to generate a quiz.\n\n"
        f"INPUT SUMMARIES:\n{combined_text}"
    )
    
    response, error = unified_llm.generate_text(prompt, temperature=0.3, max_output_tokens=2000)
    if error != "ok":
        # Fallback: Just return combined if merge fails
        return combined_text
    return response

def _extract_json_from_text(text):
    """
    Robustly extracts JSON object from text using regex.
    """
    text = text.strip()
    # Remove markdown code blocks if present
    if text.startswith("```"):
        text = text.split("\n", 1)[-1]
    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]
    
    # Attempt straightforward parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
        
    # Regex to find the first { and last }
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
            
    return None

def _generate_quiz_from_summary(summary_text, num_questions=15, difficulty="Medium"):
    """
    Generates a quiz from the final summary.
    """
    prompt = (
        f"You are an exam-grade quiz generator.\n"
        f"TASK: Generate a {num_questions}-question quiz based STRICTLY on the summary below.\n"
        f"DIFFICULTY: {difficulty}\n"
        "FORMAT: Return valid JSON only. Structure:\n"
        "{ \"questions\": [ { \"id\": 1, \"type\": \"mcq\", \"question\": \"...\", \"options\": [\"A..\", \"B..\", \"C..\", \"D..\"], \"correct_answer\": \"Full text of correct option\" } ] }\n\n"
        "RULES:\n"
        "1. Questions must be clear and student-friendly.\n"
        "2. Mix of factual and conceptual questions.\n"
        "3. Ensure correct_answer matches one of the options exactly.\n\n"
        f"LESSON SUMMARY:\n{summary_text}"
    )
    
    # Attempt 1
    response, error = unified_llm.generate_text(prompt, temperature=0.4, max_output_tokens=3000)
    if error != "ok":
        return None, error
        
    data = _extract_json_from_text(response)
    if data:
        return data, "ok"
        
    print("[pipeline] generic quiz generation failed JSON parse. Retrying...")
    
    # Retry with stricter instruction
    response, error = unified_llm.generate_text(prompt + "\n\nIMPORTANT: Return ONLY VALID JSON. No extra text.", temperature=0.2, max_output_tokens=3000)
    data = _extract_json_from_text(response)
    if data:
        return data, "ok"

    print(f"[pipeline] Failed to parse quiz JSON after retry. Response sample: {response[:100]}...")
    return None, "json_error"


MAX_CHUNK_LIMIT = 10  # Reduced chunks to prevent overload
MAX_WORKERS = 2       # Reduced threads to avoid rate limits

def _summarize_chunk_safe(chunk, index, total):
    try:
        # Small delay to spread out requests slightly
        time.sleep(0.5 * (index % 2)) 
        return _summarize_chunk(chunk, index, total)
    except Exception as e:
        print(f"[pipeline] Worker chunk {index} failed: {e}")
        return ""

def process_pdf_pipeline(pdf_base64=None, raw_text=None, pdf_name="Document"):
    """
    Full pipeline: PDF/Text -> Text -> Chunks -> Summaries -> Merge -> Quiz
    Uses multi-threading and fast-paths for optimizations.
    """
    start_time = time.time()
    
    # 1. Text Extraction / Preparation
    text = ""
    if raw_text:
        text = raw_text
    elif pdf_base64:
        if isinstance(pdf_base64, str):
            try:
                # Sanitize base64 string
                if ',' in pdf_base64:
                     pdf_base64 = pdf_base64.split(',', 1)[1]
                
                # Check for whitespace/newlines in base64
                pdf_base64 = "".join(pdf_base64.split())
                
                pdf_bytes = base64.b64decode(pdf_base64)
                
                if PyPDF2:
                    reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
                    # Extract text carefully
                    parts = []
                    for p in reader.pages:
                        extracted = p.extract_text()
                        if extracted: parts.append(extracted)
                    text = "\n".join(parts)
                else:
                    return {"success": False, "error": "PyPDF2 library not installed on server"}
            except Exception as e:
                print(f"[pipeline] PDF Decode Error: {e}")
                return {"success": False, "error": f"Invalid PDF file: {str(e)}"}
    
    text = _clean_text(text)
    if not text:
        return {"success": False, "error": "Could not extract text from PDF"}
    
    print(f"[pipeline] Extracted {len(text)} chars from {pdf_name}")
    
    # 2. Fast Path: If document is small enough (< 15,000 chars), skip summarization
    if len(text) < 15000:
        print("[pipeline] Small document detected, skipping summarization for speed...")
        # Use simple summary prompt or direct quiz generation prompt
        # Actually, let's just pretend the whole text is a summary for the next step
        # But _generate_quiz expects a summary. If text is small, it IS the summary.
        quiz_data, status = _generate_quiz_from_summary(text, num_questions=15)
        
        if status != "ok" or not quiz_data:
             return {"success": False, "error": "Failed to generate quiz questions"}
             
        total_time = time.time() - start_time
        print(f"[pipeline] Finished (Fast Path) in {total_time:.2f}s")
        return {
            "success": True,
            "quiz_title": f"Quiz: {pdf_name}",
            "total_questions": len(quiz_data.get("questions", [])),
            "questions": quiz_data.get("questions", []),
            "summary": "Full text was used for generation."
        }

    # 3. Chunking
    chunks = _split_text_into_optimized_chunks(text, word_limit=2500)
    
    # Limit number of chunks to prevent massive timeouts
    if len(chunks) > MAX_CHUNK_LIMIT:
        print(f"[pipeline] Document too large ({len(chunks)} chunks). Limiting to first {MAX_CHUNK_LIMIT} chunks.")
        chunks = chunks[:MAX_CHUNK_LIMIT]
        
    print(f"[pipeline] Processing {len(chunks)} chunks with {MAX_WORKERS} threads...")
    
    # 4. Parallel Summarization
    chunk_summaries = [None] * len(chunks)
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_idx = {
            executor.submit(_summarize_chunk_safe, chunk, i, len(chunks)): i 
            for i, chunk in enumerate(chunks)
        }
        
        for future in concurrent.futures.as_completed(future_to_idx):
            idx = future_to_idx[future]
            try:
                res = future.result()
                if res:
                    chunk_summaries[idx] = res
                    print(f"[pipeline] Chunk {idx+1} done.")
            except Exception as exc:
                print(f"[pipeline] Chunk {idx+1} generated an exception: {exc}")

    # Remove failures
    chunk_summaries = [s for s in chunk_summaries if s]
            
    # 5. Merge (or Fallback)
    final_summary = ""
    
    if not chunk_summaries:
        print("[pipeline] ALL chunks failed summarization. Attempting Fallback strategy...")
        # Fallback: Just take the first 15,000 characters of the original text
        # This ensures we always generate A quiz, even if it covers only the first part of the PDF.
        fallback_text = text[:15000]
        if len(text) > 15000:
             fallback_text += "\n\n[...Content Truncated for Quiz Generation...]"
        
        print(f"[pipeline] Fallback: Generating quiz from first {len(fallback_text)} chars.")
        final_summary = fallback_text
    else:
        print("[pipeline] Merging summaries...")
        final_summary = _merge_summaries(chunk_summaries)
    
    # 6. Quiz Generation
    print("[pipeline] Generating final quiz...")
    quiz_data, status = _generate_quiz_from_summary(final_summary)
    
    if status != "ok" or not quiz_data:
         return {"success": False, "error": "Failed to generate quiz questions"}
         
    total_time = time.time() - start_time
    print(f"[pipeline] Finished in {total_time:.2f}s")
    
    return {
        "success": True,
        "quiz_title": f"Quiz: {pdf_name}",
        "total_questions": len(quiz_data.get("questions", [])),
        "questions": quiz_data.get("questions", []),
        "summary": final_summary 
    }
