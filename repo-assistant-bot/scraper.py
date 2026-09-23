import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "").strip()


def get_headers():
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "RepoAssistantBot",
    }
    if GITHUB_TOKEN and not GITHUB_TOKEN.startswith("YOUR_"):
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return headers


def search_repositories(query: str, limit: int = 3) -> list[dict]:
    """
    Search GitHub repositories using the GitHub REST API and return the top repos sorted by stars.

    Args:
        query: Search keywords or repo name.
        limit: Number of repositories to return (default: 3).

    Returns:
        List of dicts containing full_name, url, clone_url, description, stars, language.
    """
    if not query or not query.strip():
        return []

    url = "https://api.github.com/search/repositories"
    params = {
        "q": query.strip(),
        "sort": "stars",
        "order": "desc",
        "per_page": max(1, min(limit, 10)),
    }

    try:
        response = requests.get(url, headers=get_headers(), params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        items = data.get("items", [])

        results = []
        for item in items:
            results.append({
                "full_name": item.get("full_name", ""),
                "url": item.get("html_url", ""),
                "clone_url": item.get("clone_url", ""),
                "description": item.get("description") or "No description provided.",
                "stars": item.get("stargazers_count", 0),
                "language": item.get("language") or "Not specified",
                "forks": item.get("forks_count", 0),
            })
        return results
    except requests.RequestException as e:
        print(f"[scraper] Error searching repositories for '{query}': {e}")
        return []


def fetch_file_content(repo_full_name: str, file_path: str = "README.md") -> str:
    """
    Fetch raw file content from a GitHub repository (supports default, main, or master branch).

    Args:
        repo_full_name: Repository in 'owner/repo' format.
        file_path: Relative path to the file inside the repo (default: 'README.md').

    Returns:
        String content of the file or error message if not found.
    """
    clean_repo = repo_full_name.strip().strip("/")
    clean_path = file_path.strip().lstrip("/")

    if not clean_repo or "/" not in clean_repo:
        return f"Invalid repository format '{repo_full_name}'. Please use 'owner/repo'."

    # Strategy 1: Use GitHub Contents API with raw accept header (handles any default branch)
    api_url = f"https://api.github.com/repos/{clean_repo}/contents/{clean_path}"
    headers = get_headers()
    headers["Accept"] = "application/vnd.github.v3.raw"

    try:
        resp = requests.get(api_url, headers=headers, timeout=15)
        if resp.status_code == 200:
            return resp.text
    except requests.RequestException as e:
        print(f"[scraper] API request failed for {clean_repo}/{clean_path}: {e}")

    # Strategy 2: Fallback to raw.githubusercontent.com for main and master branches
    for branch in ["main", "master"]:
        raw_url = f"https://raw.githubusercontent.com/{clean_repo}/{branch}/{clean_path}"
        try:
            resp = requests.get(raw_url, headers={"User-Agent": "RepoAssistantBot"}, timeout=10)
            if resp.status_code == 200:
                return resp.text
        except requests.RequestException:
            continue

    return f"Error: Could not retrieve file '{clean_path}' from repository '{clean_repo}'. Please verify the repository name and path."
