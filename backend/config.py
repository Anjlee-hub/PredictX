
import os
from pathlib import Path
from dotenv import load_dotenv

# Locate the main project folder
BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_FILE, override=True)

# Read environment variables
MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "predictx_db")

print("ENV file found:", ENV_FILE.exists())
print("MongoDB URL loaded:", bool(MONGODB_URL))

if not MONGODB_URL:
    raise ValueError("MONGODB_URL is missing from the .env file.")
