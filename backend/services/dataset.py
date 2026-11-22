
import pandas as pd
from pathlib import Path
from pymongo import ReplaceOne
from backend.database import db

BASE_DIR = Path(__file__).resolve().parents[2]
DATASET_PATH = BASE_DIR / "data" / "ai4i2020.csv"


def import_dataset():
    print("Reading AI4I dataset...")

    df = pd.read_csv(DATASET_PATH)

    print("Total rows:", len(df))
    print("Total columns:", len(df.columns))

    records = df.to_dict(orient="records")

    collection = db.ai4i_dataset

    operations = [
        ReplaceOne({"UDI": record["UDI"]}, record, upsert=True)
        for record in records
    ]

    result = collection.bulk_write(operations, ordered=False)

    print("Dataset import completed!")
    print("Inserted:", result.upserted_count)
    print("Updated:", result.modified_count)
    print("Total records in MongoDB:", collection.count_documents({}))


if __name__ == "__main__":
    import_dataset()
