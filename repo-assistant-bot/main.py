import logging
import os
import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from dotenv import load_dotenv
from telegram import Update
from telegram.constants import ParseMode
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
)

from ai_engine import analyze_code_content, answer_developer_query
from scraper import fetch_file_content, search_repositories

# Load environment variables
load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()

# Configure logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

TELEGRAM_MAX_MESSAGE_LENGTH = 4000


async def send_chunked_message(
    update: Update,
    text: str,
    parse_mode: str = ParseMode.MARKDOWN,
) -> None:
    """
    Send messages in chunks if they exceed Telegram's 4096 character limit.
    Attempts formatting with parse_mode first; falls back to plain text if markup fails.
    """
    if not text:
        return

    # Split text into safe chunks
    chunks = []
    current_chunk = ""

    for line in text.splitlines(keepends=True):
        if len(current_chunk) + len(line) <= TELEGRAM_MAX_MESSAGE_LENGTH:
            current_chunk += line
        else:
            if current_chunk:
                chunks.append(current_chunk)
            # If a single line itself exceeds the limit, hard-slice it
            while len(line) > TELEGRAM_MAX_MESSAGE_LENGTH:
                chunks.append(line[:TELEGRAM_MAX_MESSAGE_LENGTH])
                line = line[TELEGRAM_MAX_MESSAGE_LENGTH:]
            current_chunk = line

    if current_chunk:
        chunks.append(current_chunk)

    for chunk in chunks:
        try:
            await update.message.reply_text(chunk, parse_mode=parse_mode, disable_web_page_preview=True)
        except Exception:
            # Fallback to plain text if Markdown/HTML parsing fails
            await update.message.reply_text(chunk, disable_web_page_preview=True)


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /start command: Welcome message and command directory."""
    welcome_text = (
        "🤖 *Welcome to the Repository Assistant Bot!*\n\n"
        "I am your developer assistant for discovering repositories, analyzing source code, "
        "and resolving programming doubts using Google Gemini AI.\n\n"
        "🛠 *Available Commands:*\n"
        "• `/search <query>` — Search top GitHub repositories by stars\n"
        "• `/review <owner/repo> [file]` — Fetch & perform AI code review (defaults to README.md)\n"
        "• `/ask <question>` — Ask technical/debugging questions to Gemini 2.5 Flash\n"
        "• `/guide` — Step-by-step developer guide on cloning & running projects\n"
        "• `/help` — Show this help message\n\n"
        "💡 *Examples:*\n"
        "• `/search fastapi auth`\n"
        "• `/review psf/requests setup.py`\n"
        "• `/ask How do I optimize PostgreSQL connection pooling?`"
    )
    await update.message.reply_text(welcome_text, parse_mode=ParseMode.MARKDOWN)


async def guide_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /guide command: Instructions on cloning and executing standard projects."""
    guide_text = (
        "🚀 *Step-by-Step Developer Guide: Cloning & Running Projects*\n\n"
        "1️⃣ *Clone the Repository*\n"
        "```bash\n"
        "git clone https://github.com/owner/repository.git\n"
        "cd repository\n"
        "```\n\n"
        "2️⃣ *Python Projects Setup*\n"
        "```bash\n"
        "# 1. Create a virtual environment\n"
        "python -m venv .venv\n\n"
        "# 2. Activate virtual environment\n"
        "# On Linux/macOS:\n"
        "source .venv/bin/activate\n"
        "# On Windows (PowerShell):\n"
        ".venv\\Scripts\\Activate.ps1\n\n"
        "# 3. Install dependencies\n"
        "pip install -r requirements.txt\n"
        "```\n\n"
        "3️⃣ *Node.js / TypeScript Projects Setup*\n"
        "```bash\n"
        "npm install   # or yarn / pnpm install\n"
        "npm run dev   # or npm start\n"
        "```\n\n"
        "4️⃣ *Environment Configuration*\n"
        "• Copy `.env.example` to `.env` if provided:\n"
        "```bash\n"
        "cp .env.example .env\n"
        "```\n"
        "• Populate your required API keys, database credentials, and ports.\n\n"
        "5️⃣ *Run Tests & Verify*\n"
        "```bash\n"
        "pytest        # Python\n"
        "npm test      # Node.js\n"
        "```"
    )
    await send_chunked_message(update, guide_text, parse_mode=ParseMode.MARKDOWN)


async def search_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /search command: Search GitHub repositories."""
    if not context.args:
        await update.message.reply_text(
            "⚠️ Please provide a search query.\n\n"
            "Example: `/search fastapi authentication`",
            parse_mode=ParseMode.MARKDOWN,
        )
        return

    query = " ".join(context.args)
    await update.message.reply_text(f"🔍 Searching GitHub repositories for *'{query}'*...", parse_mode=ParseMode.MARKDOWN)

    repos = search_repositories(query, limit=3)
    if not repos:
        await update.message.reply_text(f"No repositories found matching '{query}'. Try different keywords.")
        return

    results_text = f"⭐ *Top GitHub Repositories for '{query}':*\n\n"
    for i, repo in enumerate(repos, 1):
        results_text += (
            f"*{i}. [{repo['full_name']}]({repo['url']})*\n"
            f"🌟 *Stars:* {repo['stars']:,} | 🔤 *Language:* {repo['language']}\n"
            f"📝 {repo['description']}\n"
            f"📦 `git clone {repo['clone_url']}`\n"
            f"🔎 Review with: `/review {repo['full_name']}`\n\n"
        )

    await send_chunked_message(update, results_text, parse_mode=ParseMode.MARKDOWN)


async def review_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /review command: Fetch repo file content and review with Gemini AI."""
    if not context.args:
        await update.message.reply_text(
            "⚠️ Please provide a repository name.\n\n"
            "Usage: `/review <owner/repo> [file_path]`\n"
            "Example: `/review octocat/Hello-World README`",
            parse_mode=ParseMode.MARKDOWN,
        )
        return

    repo_full_name = context.args[0]
    file_path = context.args[1] if len(context.args) > 1 else "README.md"

    status_msg = await update.message.reply_text(
        f"📥 Fetching `{file_path}` from `{repo_full_name}` and analyzing with Gemini AI...",
        parse_mode=ParseMode.MARKDOWN,
    )

    content = fetch_file_content(repo_full_name, file_path)
    if content.startswith("Error:") or content.startswith("Invalid repository"):
        await status_msg.edit_text(content)
        return

    review_result = analyze_code_content(content)
    header = f"📋 *AI Code Review: {repo_full_name}* (`{file_path}`)\n\n"
    full_response = header + review_result

    await send_chunked_message(update, full_response, parse_mode=ParseMode.MARKDOWN)


async def ask_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /ask command: Developer Q&A powered by Gemini AI."""
    if not context.args:
        await update.message.reply_text(
            "⚠️ Please provide a question.\n\n"
            "Example: `/ask What is the difference between asyncio.gather and TaskGroup?`",
            parse_mode=ParseMode.MARKDOWN,
        )
        return

    question = " ".join(context.args)
    await update.message.reply_text("🤔 Thinking... consulting Gemini 2.5 Flash...", parse_mode=ParseMode.MARKDOWN)

    answer = answer_developer_query(question)
    header = f"💬 *Q: {question}*\n\n"
    full_response = header + answer

    await send_chunked_message(update, full_response, parse_mode=ParseMode.MARKDOWN)


def main() -> None:
    """Initialize and run the Telegram bot."""
    if not TELEGRAM_BOT_TOKEN or TELEGRAM_BOT_TOKEN.startswith("YOUR_"):
        print("[CRITICAL] TELEGRAM_BOT_TOKEN is missing or not configured in .env file.")
        print("Please edit .env and provide your actual Telegram Bot Token.")
        sys.exit(1)

    print("🤖 Initializing Telegram Repository Assistant Bot...")
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    # Register command handlers
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("help", start_command))
    application.add_handler(CommandHandler("guide", guide_command))
    application.add_handler(CommandHandler("search", search_command))
    application.add_handler(CommandHandler("review", review_command))
    application.add_handler(CommandHandler("ask", ask_command))

    print("🚀 Bot is running and polling for messages (Press Ctrl+C to stop)...")
    application.run_polling()


if __name__ == "__main__":
    main()
