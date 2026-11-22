
from pymongo import MongoClient
from backend.config import MONGODB_URL, DATABASE_NAME

client = MongoClient(MONGODB_URL)
db = client[DATABASE_NAME]

def connect_to_database():
    try:
        client.admin.command("ping")
        print("MongoDB connected successfully!")
        return True
    except Exception as e:
        print("MongoDB connection failed:", e)
        return False


def create_collections():
    try:
        required_collections = [
            "machines",
            "sensor_readings",
            "predictions"
        ]

        existing_collections = db.list_collection_names()

        for collection in required_collections:
            if collection not in existing_collections:
                db.create_collection(collection)
                print(f"Created collection: {collection}")
            else:
                print(f"Collection already exists: {collection}")

    except Exception as e:
        print("Collection creation failed:", e)
