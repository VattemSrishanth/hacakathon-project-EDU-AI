const http = require("http");
const https = require("https");

const SOURCES = [
  { name: "NDTV", url: "https://www.ndtv.com/rss/education" },
  { name: "Times of India", url: "https://timesofindia.indiatimes.com/rssfeeds/913168846.cms" },
  { name: "MSN News", url: "https://rss.msn.com/en-in/news/education" }
];

const EDU_IMAGES = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200",
  "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200",
  "https://images.unsplash.com/photo-1523050335392-9affa09dfda2?q=80&w=1200"
];

function pickImage() {
  return EDU_IMAGES[Math.floor(Math.random() * EDU_IMAGES.length)];
}

function getUrl(url, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          resolve(getUrl(res.headers.location, timeoutMs));
          return;
        }

        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => resolve({ status: res.statusCode, text: data }));
      }
    );

    req.on("error", reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error("Request timed out"));
    });
  });
}

function stripCdata(value) {
  if (!value) return "";
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1");
}

function stripHtml(value) {
  if (!value) return "";
  return value.replace(/<[^>]+>/g, "").trim();
}

function extractTag(block, tagName) {
  const re = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = block.match(re);
  return match ? stripCdata(match[1]).trim() : "";
}

function extractAttribute(block, tagName, attrName) {
  const re = new RegExp(`<${tagName}[^>]*${attrName}=["']([^"']+)["'][^>]*>`, "i");
  const match = block.match(re);
  return match ? match[1] : "";
}

function parseItems(xml, sourceName) {
  const items = [];
  const itemBlocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];

  for (const block of itemBlocks.slice(0, 8)) {
    const title = extractTag(block, "title");
    const link = extractTag(block, "link");
    if (!title || !link) {
      continue;
    }

    let description = stripHtml(extractTag(block, "description"));
    if (description.length > 200) {
      description = `${description.slice(0, 200)}...`;
    }

    const pubDateRaw = extractTag(block, "pubDate");
    const pubDate = pubDateRaw ? new Date(pubDateRaw) : new Date();

    let imageUrl = extractAttribute(block, "media:content", "url");
    if (!imageUrl) {
      imageUrl = extractAttribute(block, "enclosure", "url");
    }
    if (!imageUrl) {
      imageUrl = pickImage();
    }

    items.push({
      title,
      description,
      source: sourceName,
      publish_date: pubDate.toISOString(),
      link,
      image_url: imageUrl
    });
  }

  return items;
}

async function fetchAll() {
  const results = [];

  for (const source of SOURCES) {
    try {
      const response = await getUrl(source.url);
      if (response.status === 200) {
        results.push(...parseItems(response.text, source.name));
      }
    } catch (error) {
      // Keep going if one source fails.
    }
  }

  return results;
}

fetchAll()
  .then((items) => {
    process.stdout.write(JSON.stringify(items));
  })
  .catch(() => {
    process.stdout.write("[]");
  });
