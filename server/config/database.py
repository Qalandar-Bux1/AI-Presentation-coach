import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import PyMongoError

from utils.path_utils import get_env_path

# Ensure .env is loaded from the correct location in dev and packaged mode.
load_dotenv(get_env_path())

DEFAULT_MONGO_URI = "mongodb+srv://buxq4935_db_user:gZoKgwr3vMiBYv3e@cluster0.hsaifuk.mongodb.net/?retryWrites=true&w=majority"
MONGO_URI = os.getenv("MONGO_URI", DEFAULT_MONGO_URI)
DB_NAME = os.getenv("DB_NAME", "ai_presentation_coach")

_client = None
_db = None


def _connect():
    global _client, _db
    if _client is not None and _db is not None:
        return _db

    try:
        # Be more tolerant with DNS/connect timeouts. On new networks/PCs,
        # Windows may have multiple DNS servers where some respond slowly.
        mongo_kwargs = {
            "serverSelectionTimeoutMS": 30000,
            "connectTimeoutMS": 60000,
            "socketTimeoutMS": 60000,
        }
        # In some packaged environments, relying on OS cert store can fail.
        # Using certifi provides a known-good CA bundle for TLS.
        try:
            import certifi  # type: ignore

            mongo_kwargs["tlsCAFile"] = certifi.where()
        except Exception:
            pass

        _client = MongoClient(MONGO_URI, **mongo_kwargs)
        _client.admin.command("ping")
        _db = _client[DB_NAME]
        return _db
    except PyMongoError as exc:
        _client = None
        _db = None
        raise ConnectionError(f"Failed to connect to MongoDB Atlas: {exc}") from exc


def get_database():
    return _connect()


def get_collection(collection_name: str):
    return get_database()[collection_name]


def test_database_connection():
    try:
        db = get_database()
        return True, f"Connected to MongoDB database '{db.name}' successfully."
    except Exception as exc:
        return False, str(exc)

