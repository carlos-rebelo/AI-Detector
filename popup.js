
const scanBtn = document.getElementById("scanBtn");

scanBtn.addEventListener("click", () => {
  scanBtn.disabled = true;
  document.getElementById("result").textContent = "Analyzing text...";

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "getText" },
      function (response) {
        if (chrome.runtime.lastError) {
          document.getElementById("result").textContent =
            "Error: Could not connect to content script. Are you on a supported page?";
          scanBtn.disabled = false;
          return;
        }

        if (response && response.text) {
          const sampleText = response.text.slice(0, 1000);

          fetch("https://api.sapling.ai/api/v1/aidetect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              key: API_KEY,
              text: sampleText,
              sent_scores: true,
              score_string: false,
              version: "20240606"
            })
          })
            .then(res => res.json())
            .then(data => {
              console.log("API response:", data);
              if (data && data.score !== undefined) {
                const resultText =
                  data.score > 0.5
                    ? `Likely AI-generated (score: ${data.score.toFixed(3)})`
                    : `Likely human-written (score: ${data.score.toFixed(3)})`;
                document.getElementById("result").textContent = resultText;
              } else {
                document.getElementById("result").textContent =
                  "Could not determine content origin.";
              }
            })
            .catch(err => {
              console.error(err);
              document.getElementById("result").textContent = "API error occurred.";
            })
            .finally(() => {
              scanBtn.disabled = false;
            });
        } else {
          document.getElementById("result").textContent = "No text found.";
          scanBtn.disabled = false;
        }
      }
    );
  });
});

// Tab switching
const detectorTab = document.getElementById("detectorTab");
const summarizerTab = document.getElementById("summarizerTab");
const detectorView = document.getElementById("detectorView");
const summarizerView = document.getElementById("summarizerView");

detectorTab.addEventListener("click", () => {
  detectorTab.classList.add("active-tab");
  summarizerTab.classList.remove("active-tab");
  detectorView.style.display = "block";
  summarizerView.style.display = "none";
});

summarizerTab.addEventListener("click", () => {
  summarizerTab.classList.add("active-tab");
  detectorTab.classList.remove("active-tab");
  summarizerView.style.display = "block";
  detectorView.style.display = "none";
});

// Summarizer
const summarizeBtn = document.getElementById("summarizeBtn");
const summaryResult = document.getElementById("summaryResult");
const inputTextEl = document.getElementById("inputText");
const wordCountDisplay = document.getElementById("wordCount");

inputTextEl.addEventListener("input", () => {
  const wc = countWords(inputTextEl.value);
  wordCountDisplay.textContent = `${wc} / 300 words`;
});

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

summarizeBtn.addEventListener("click", () => {
  const inputText = inputTextEl.value.trim();
  const wordCount = countWords(inputText);

  if (!inputText) {
    summaryResult.textContent = "Please enter some text to summarize.";
    return;
  }

  if (wordCount > 300) {
    summaryResult.textContent = `Please limit your input to 300 words. Currently: ${wordCount}`;
    return;
  }

  summarizeBtn.disabled = true;
  summaryResult.textContent = "Summarizing...";

  fetch("https://api.sapling.ai/api/v1/summarize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      key: API_KEY,
      text: inputText
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data && data.result) {
        summaryResult.textContent = data.result;
      } else {
        summaryResult.textContent = "Could not generate summary.";
      }
    })
    .catch(err => {
      console.error("Summarization error:", err);
      summaryResult.textContent = "Error occurred during summarization.";
    })
    .finally(() => {
      summarizeBtn.disabled = false;
    });
});
const clearBtn = document.getElementById("clearBtn");

clearBtn.addEventListener("click", () => {
  document.getElementById("inputText").value = "";
  document.getElementById("summaryResult").textContent = "";
  document.getElementById("wordCount").textContent = "0 / 300 words";
});

const manualInput = document.getElementById("manualInput");
const analyzeTextBtn = document.getElementById("analyzeTextBtn");
const manualWordCount = document.getElementById("manualWordCount");
const manualResult = document.getElementById("manualResult");

// Live word count update
manualInput.addEventListener("input", () => {
  const wc = countWords(manualInput.value);
  manualWordCount.textContent = `${wc} / 300 words`;
});

// Manual text AI detection
analyzeTextBtn.addEventListener("click", () => {
  const inputText = manualInput.value.trim();
  const wordCount = countWords(inputText);

  if (!inputText) {
    manualResult.textContent = "Please enter text to analyze.";
    return;
  }

  if (wordCount > 300) {
    manualResult.textContent = `Please limit to 300 words. Currently: ${wordCount}`;
    return;
  }

  analyzeTextBtn.disabled = true;
  manualResult.textContent = "Analyzing...";

  fetch("https://api.sapling.ai/api/v1/aidetect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: API_KEY,
      text: inputText,
      sent_scores: true,
      score_string: false,
      version: "20240606"
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data && data.score !== undefined) {
        const resultText =
          data.score > 0.5
            ? `Likely AI-generated (score: ${data.score.toFixed(3)})`
            : `Likely human-written (score: ${data.score.toFixed(3)})`;
        manualResult.textContent = resultText;
      } else {
        manualResult.textContent = "Could not determine content origin.";
      }
    })
    .catch(err => {
      console.error("Manual analysis error:", err);
      manualResult.textContent = "API error occurred.";
    })
    .finally(() => {
      analyzeTextBtn.disabled = false;
    });
});
const clearInputBtn = document.getElementById("clearInputBtn");

clearInputBtn.addEventListener("click", () => {
  manualInput.value = "";
  manualWordCount.textContent = "0 / 300 words";
  manualResult.textContent = "";
});

