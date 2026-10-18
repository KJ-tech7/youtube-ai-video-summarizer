
console.log("YT Summarizer loaded");

function isVideoPage() {
  return (
    window.location.pathname === "/watch" &&
    window.location.search.includes("v=")
  );
}

function addSummaryButton() {
  if (!isVideoPage()) return;
  if (document.getElementById("yt-summarizer-btn")) return;

  const btn = document.createElement("button");
  btn.id = "yt-summarizer-btn";
  btn.textContent = "Summarize this video";

  btn.style.cssText =
    "position:fixed;top:70px;right:20px;z-index:999999;" +
    "padding:12px 18px;font-size:15px;background:#111;color:white;" +
    "border:2px solid white;border-radius:8px;cursor:pointer;";

  btn.addEventListener("click", async function () {
    btn.disabled = true;
    btn.textContent = "Extracting transcript...";

    try {
      // Find and open the transcript panel if available.
      const transcriptButton = [
        ...document.querySelectorAll("button")
      ].find(button =>
        /show transcript/i.test(button.innerText || "")
      );

      if (transcriptButton) {
        transcriptButton.click();
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Find transcript text using supported YouTube page selectors.
      const selectors = [
        "ytd-transcript-segment-renderer .segment-text",
        "transcript-segment-view-model .segment-text",
        "transcript-segment-view-model [role='text']"
      ];

      let lines = [];

      for (const selector of selectors) {
        lines = [...document.querySelectorAll(selector)]
          .map(element =>
            (element.innerText || element.textContent || "").trim()
          )
          .filter(Boolean);

        if (lines.length > 0) break;
      }

      if (lines.length === 0) {
        throw new Error(
          "Transcript not found. Open the YouTube video description, " +
          "click Show transcript, and try again."
        );
      }

      const transcript = lines.join("\n");

      console.log(
        "Transcript extracted:",
        transcript.length,
        "characters"
      );

      btn.textContent = "Generating AI summary...";

      // Send transcript to the local Node.js backend.
      const response = await fetch(
        "http://127.0.0.1:3000/summarize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ transcript })
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          `Backend returned an invalid response (HTTP ${response.status}).`
        );
      }

      if (!response.ok) {
        const message =
          typeof data.error === "string"
            ? data.error
            : data.error?.message || JSON.stringify(data.error);

        throw new Error(
          message || `Request failed with HTTP ${response.status}.`
        );
      }

      if (typeof data.summary !== "string" || !data.summary.trim()) {
        throw new Error("The backend returned no summary.");
      }

      // Create or update the summary panel.
      let panel = document.getElementById("yt-summary-panel");

      if (!panel) {
        panel = document.createElement("div");
        panel.id = "yt-summary-panel";
        document.body.appendChild(panel);
      }

      panel.style.cssText =
        "position:fixed;top:125px;right:20px;width:350px;" +
        "max-width:calc(100vw - 40px);max-height:65vh;" +
        "overflow-y:auto;background:#fff;color:#222;" +
        "padding:18px;z-index:999999;border:1px solid #ccc;" +
        "border-radius:10px;white-space:pre-wrap;" +
        "font:14px/1.6 Arial,sans-serif;" +
        "box-shadow:0 4px 18px rgba(0,0,0,.25);";

      const closeButton = document.createElement("button");
      closeButton.textContent = "Close";
      closeButton.style.cssText =
        "float:right;padding:5px 10px;cursor:pointer;";

      closeButton.addEventListener("click", () => panel.remove());

      const heading = document.createElement("h3");
      heading.textContent = "AI Video Summary";
      heading.style.cssText = "margin:0 0 12px;";

      const summaryText = document.createElement("div");
      summaryText.textContent = data.summary;

      panel.replaceChildren(closeButton, heading, summaryText);

      btn.textContent = "Summary generated!";
      console.log("YT Summarizer: summary generated successfully");

    } catch (error) {
      console.error("YT Summarizer error details:", error);

      btn.textContent = "Try again";

      const errorMessage =
        error?.message || String(error) || "Unknown error";

      alert("Summarization failed:\n" + errorMessage);

    } finally {
      btn.disabled = false;
    }
  });

  document.body.appendChild(btn);
  console.log("YT Summarizer: button added");
}

// Watch for YouTube's dynamic page navigation.
const observer = new MutationObserver(addSummaryButton);

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

addSummaryButton();
