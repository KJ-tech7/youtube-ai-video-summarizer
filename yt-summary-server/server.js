
import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.error("ERROR: GROQ_API_KEY is missing from .env");
  process.exit(1);
}

app.get("/", (req, res) => {
  res.send("YT Summarizer backend is running with Groq!");
});

app.post("/summarize", async (req, res) => {
  try {
    const { transcript } = req.body ?? {};

    if (typeof transcript !== "string" || !transcript.trim()) {
      return res.status(400).json({
        error: "A valid transcript is required."
      });
    }

    console.log(`Received transcript: ${transcript.length} characters`);

    const apiResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          include_reasoning: false,
          messages: [
            {
              role: "system",
              content:
                "Summarize YouTube transcripts in simple language. " +
                "Include an overview, key points, important takeaways, " +
                "and a conclusion. Always provide a final written summary."
            },
            {
              role: "user",
              content:
                "Summarize this video transcript:\n\n" +
                transcript.slice(0, 16000)
            }
          ],
          max_completion_tokens: 2000,
          temperature: 0.3,
          stream: false
        })
      }
    );

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("Groq API error:", data);

      return res.status(apiResponse.status).json({
        error: data.error?.message || "Groq API request failed."
      });
    }

    const choice = data.choices?.[0];
    const summary = choice?.message?.content?.trim();

    if (!summary) {
      console.error("Empty model response:", JSON.stringify({
        finish_reason: choice?.finish_reason,
        message: choice?.message
      }));

      throw new Error(
        "Groq returned no final text. Check the server terminal for details."
      );
    }

    console.log("Summary generated successfully.");

    return res.json({ summary });

  } catch (error) {
    console.error("Summarization error:", error);

    return res.status(500).json({
      error: error.message || "Unable to summarize the video."
    });
  }
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`YT Summarizer backend running at http://127.0.0.1:${PORT}`);
});
