# 🤖 Repository Assistant Bot

A feature-complete Telegram bot that acts as an intelligent repository assistant, powered by the GitHub REST API and Google Gemini 2.5 Flash.

---

## 🌟 Features

- 🔍 **Repository Search (`/search <query>`)**: Discovers top GitHub repositories sorted by stars using GitHub's REST API. Returns full repo names, stargazers count, language, descriptions, and clone links.
- 📋 **AI Code & Readme Review (`/review <owner/repo> [file]`)**: Fetches repository files (defaulting to `README.md`) from the default/main/master branch and performs a deep AI review using **Gemini 2.5 Flash** (analyzes architecture, code quality, potential bugs, and improvements).
- 💬 **Developer Q&A (`/ask <question>`)**: Senior developer assistant powered by Gemini 2.5 Flash for resolving programming, architecture, and debugging challenges.
- 🚀 **Developer Guide (`/guide`)**: Step-by-step instructions for cloning, setting up virtual environments, installing dependencies, configuring `.env`, and running projects.
- 🛡️ **Production-Ready Telegram Integration**: Robust chunking for messages exceeding Telegram's 4,096 character limit, safe Markdown rendering with plain-text fallback, and UTF-8 console output on Windows.

---

## 📁 Project Structure

```
repo-assistant-bot/
├── .env                 # Environment variables (Tokens & API keys)
├── requirements.txt     # Python package dependencies
├── scraper.py           # GitHub REST API interaction module
├── ai_engine.py         # Google GenAI (Gemini 2.5 Flash) integration module
├── main.py              # Telegram bot handlers & polling engine
├── test_modules.py      # Automated module verification test suite
└── README.md            # Documentation and instructions
```

---

## ⚙️ Setup & Configuration

### 1. Configure API Keys in `.env`

Edit `.env` inside `repo-assistant-bot/`:

```env
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
GITHUB_TOKEN="your_github_personal_access_token"
GEMINI_API_KEY="your_gemini_api_key"
```

> **Note:** Replace `YOUR_GEMINI_API_KEY` with your actual Google Gemini API key obtained from [Google AI Studio](https://aistudio.google.com/).

### 2. Activate Virtual Environment & Dependencies

From the `repo-assistant-bot` folder:

**Windows (PowerShell):**
```powershell
.venv\Scripts\Activate.ps1
# or execute directly with .venv\Scripts\python.exe
```

**Linux / macOS:**
```bash
source .venv/bin/activate
pip install -r requirements.txt
```

---

## 🧪 Run Tests

To verify that the GitHub API, scraper, and AI modules are functioning properly without errors:

```powershell
.venv\Scripts\python.exe test_modules.py
```

---

## 🚀 Launching the Bot

To start polling and listen for commands on Telegram:

```powershell
.venv\Scripts\python.exe main.py
```

Press `Ctrl + C` in your terminal to safely stop the bot.
