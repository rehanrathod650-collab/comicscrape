import os
import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure repo-assistant-bot directory is on Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from scraper import search_repositories, fetch_file_content
from ai_engine import analyze_code_content, answer_developer_query


def run_tests():
    print("=" * 60)
    print("🧪 Running Validation Tests for Repository Assistant Bot")
    print("=" * 60)

    # Test 1: GitHub Search Repositories
    print("\n[Test 1] Testing GitHub Repository Search...")
    search_query = "fastapi"
    repos = search_repositories(search_query, limit=2)
    assert isinstance(repos, list), "search_repositories should return a list"
    assert len(repos) > 0, f"Expected at least 1 repository for query '{search_query}', got {len(repos)}"
    first_repo = repos[0]
    required_keys = ["full_name", "url", "clone_url", "description", "stars", "language"]
    for key in required_keys:
        assert key in first_repo, f"Missing key '{key}' in search result"
    print(f"  ✅ GitHub Search passed. Top result: {first_repo['full_name']} ({first_repo['stars']} stars)")

    # Test 2: GitHub Fetch File Content
    print("\n[Test 2] Testing GitHub File Fetching...")
    # 'octocat/Hello-World' has a README file
    content = fetch_file_content("octocat/Hello-World", "README")
    assert isinstance(content, str), "fetch_file_content should return a string"
    assert not content.startswith("Error:"), f"Failed to fetch file: {content}"
    assert not content.startswith("Invalid repository"), f"Invalid repo error: {content}"
    assert len(content) > 0, "Fetched content was empty"
    print(f"  ✅ GitHub File Fetch passed. Content preview: {repr(content.strip()[:50])}")

    # Test 3: AI Engine Module & Fallback Handling
    print("\n[Test 3] Testing AI Engine Code Analysis...")
    sample_code = """
def calculate_average(numbers: list[float]) -> float:
    if not numbers:
        return 0.0
    return sum(numbers) / len(numbers)
"""
    review_output = analyze_code_content(sample_code)
    assert isinstance(review_output, str), "analyze_code_content should return a string"
    assert len(review_output) > 0, "analyze_code_content output is empty"
    print(f"  ✅ AI Engine Code Analysis executed cleanly. Response preview: {repr(review_output[:80])}...")

    # Test 4: AI Engine Developer Q&A
    print("\n[Test 4] Testing AI Engine Developer Q&A...")
    sample_question = "What is the difference between a list and a tuple in Python?"
    qa_output = answer_developer_query(sample_question)
    assert isinstance(qa_output, str), "answer_developer_query should return a string"
    assert len(qa_output) > 0, "answer_developer_query output is empty"
    print(f"  ✅ AI Engine Q&A executed cleanly. Response preview: {repr(qa_output[:80])}...")

    print("\n" + "=" * 60)
    print("🎉 ALL MODULE TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
