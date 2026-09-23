import os
from dotenv import load_dotenv
from google import genai
from google.genai import errors

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip().strip('"').strip("'")

# Initialize GenAI Client
_client = None
if GEMINI_API_KEY and GEMINI_API_KEY != "YOUR_GEMINI_API_KEY":
    try:
        _client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"[ai_engine] Warning: Failed to initialize genai.Client: {e}")
        _client = None
else:
    # Client will attempt default or inform user when called
    try:
        _client = genai.Client(api_key=GEMINI_API_KEY if GEMINI_API_KEY else None)
    except Exception:
        _client = None


def get_client() -> genai.Client:
    """Return an active GenAI client or initialize one if possible."""
    global _client
    if _client is not None:
        return _client
    key = os.getenv("GEMINI_API_KEY", "").strip().strip('"').strip("'")
    if key and key != "YOUR_GEMINI_API_KEY":
        _client = genai.Client(api_key=key)
        return _client
    raise ValueError("GEMINI_API_KEY is not configured. Please set your Gemini API key in the .env file.")


def _generate_with_fallback(client: genai.Client, prompt: str) -> str:
    """Attempt generation with gemini-2.5-flash, falling back to gemini-3.6-flash if retired."""
    primary_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    fallback_model = "gemini-3.6-flash"

    try:
        response = client.models.generate_content(
            model=primary_model,
            contents=prompt,
        )
        return response.text or "No response could be generated."
    except errors.APIError as ae:
        # If the API reports that the model is no longer available, attempt fallback
        if "no longer available" in str(ae).lower() and primary_model != fallback_model:
            response = client.models.generate_content(
                model=fallback_model,
                contents=prompt,
            )
            return response.text or "No response could be generated."
        raise ae


def analyze_code_content(code_text: str) -> str:
    """
    Analyze code or repository documentation using Gemini AI.
    Generates code reviews, architectural highlights, key features, and potential bugs.

    Args:
        code_text: The source code or documentation to analyze.

    Returns:
        Structured review and analysis text.
    """
    if not code_text or not code_text.strip():
        return "No content was provided for analysis."

    # Truncate content if excessively long for prompt context efficiency
    max_chars = 30000
    truncated = False
    if len(code_text) > max_chars:
        code_text = code_text[:max_chars]
        truncated = True

    prompt = (
        "You are an expert software engineer and code auditor. "
        "Analyze the following code / repository content and provide a comprehensive review with these sections:\n"
        "1. 📌 **Architecture & Key Features**: Summary of purpose, tech stack, and key capabilities.\n"
        "2. 🔍 **Code Quality & Best Practices**: Strengths, structure, readability, and conventions.\n"
        "3. ⚠️ **Potential Bugs & Edge Cases**: Flaws, vulnerabilities, edge cases, or missing error handling.\n"
        "4. 💡 **Recommendations & Improvements**: Actionable tips for enhancement.\n\n"
        f"Content to review:\n```\n{code_text}\n```"
    )

    if truncated:
        prompt += "\n*(Note: Content was truncated due to size limits)*"

    try:
        client = get_client()
        return _generate_with_fallback(client, prompt)
    except ValueError as ve:
        return f"⚠️ Configuration Notice: {ve}"
    except errors.APIError as ae:
        return f"⚠️ Gemini API Error: {ae.message if hasattr(ae, 'message') else ae}"
    except Exception as e:
        return f"⚠️ Error during code analysis: {str(e)}"


def answer_developer_query(question: str) -> str:
    """
    Answer general programming, architectural, and debugging questions using Gemini 2.5 Flash.

    Args:
        question: Developer's programming or debugging inquiry.

    Returns:
        Clear, actionable explanation and solution.
    """
    if not question or not question.strip():
        return "Please ask a specific developer question."

    prompt = (
        "You are an expert senior software engineer and mentor. "
        "Answer the following developer question clearly, concisely, and accurately. "
        "Include concise, practical code snippets where helpful:\n\n"
        f"Question: {question.strip()}"
    )

    try:
        client = get_client()
        return _generate_with_fallback(client, prompt)
    except ValueError as ve:
        return f"⚠️ Configuration Notice: {ve}"
    except errors.APIError as ae:
        return f"⚠️ Gemini API Error: {ae.message if hasattr(ae, 'message') else ae}"
    except Exception as e:
        return f"⚠️ Error answering query: {str(e)}"
