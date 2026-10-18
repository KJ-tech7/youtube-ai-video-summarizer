# YouTube AI Video Summarizer

A Chrome extension that generates concise AI-powered summaries of YouTube videos using their available transcripts.

## Features

- Extracts available video transcripts from YouTube.
- Generates concise summaries using the Groq AI API.
- Displays summaries through an easy-to-use interface.
- Uses a Node.js and Express.js backend.
- Keeps API credentials in environment variables.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Browser Extension:** Chrome Extension APIs
- **Backend:** Node.js, Express.js
- **AI Integration:** Groq API
- **Tools:** VS Code, Git, GitHub

## How It Works

1. Open a YouTube video in Chrome.
2. Click the extension's **Summarize this video** button.
3. The extension retrieves the available transcript.
4. The transcript is sent to the local Express.js backend.
5. The backend sends the transcript to the Groq API.
6. The generated summary is displayed in the extension.

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/KJ-tech7/youtube-ai-video-summarizer.git
cd youtube-ai-video-summarizer
```

### 2. Configure the Backend

```bash
cd yt-summary-server
npm install
```

Create a `.env` file inside the `yt-summary-server` folder:

```env
GROQ_API_KEY=your_groq_api_key
```

Replace `your_groq_api_key` with your own Groq API key. Do not upload this file to GitHub.

### 3. Start the Backend

```bash
node server.js
```

Keep the terminal running while using the extension.

### 4. Load the Chrome Extension

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the cloned repository's main folder containing `manifest.json`.
5. Open a YouTube video and use the summarization button.

## Requirements

- Google Chrome
- Node.js and npm
- A valid Groq API key
- Internet connection

**Note:** The current version uses a locally running backend at `http://127.0.0.1:3000`. Video summarization depends on transcript availability and valid API access.

## Future Improvements

- Add summary length options.
- Improve transcript extraction and error handling.
- Deploy the backend for easier access.
- Add support for multiple languages.

## Author

**Keshav Jangid**

GitHub: https://github.com/KJ-tech7
