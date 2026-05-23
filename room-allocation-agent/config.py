from dotenv import load_dotenv
import os

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
NEST_BASE_URL = os.getenv("NEST_BASE_URL", "http://localhost:4000")
CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:3000")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in environment")
