function askAI() {
  const question = document.getElementById("question").value;

  fetch("http://127.0.0.1:5000/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      question: question,
      online: navigator.onLine
    })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("answer").innerText = data.answer;
  })
  .catch(() => {
    document.getElementById("answer").innerText =
      "Offline mode: Please read the lesson.";
  });
}
let mode = "normal";

function setMode(selectedMode) {
  mode = selectedMode;
  alert("Accessibility Mode: " + mode);
}

function askAI() {
  const question = document.getElementById("question").value;

  fetch("http://127.0.0.1:5000/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: question,
      online: navigator.onLine,
      mode: mode
    })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("answer").innerText = data.answer;
  });
}
