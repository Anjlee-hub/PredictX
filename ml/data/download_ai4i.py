
from pathlib import Path

import pandas as pd
from ucimlrepo import fetch_ucirepo


def download_ai4i() -> None:
    """Download and save the original UCI AI4I 2020 dataset."""

    project_root = Path(__file__).resolve().parents[2]
    raw_dir = project_root / "ml" / "data" / "raw"
    output_file = raw_dir / "ai4i2020.csv"

    raw_dir.mkdir(parents=True, exist_ok=True)

    print("Downloading UCI AI4I 2020 dataset...")

    dataset = fetch_ucirepo(id=601)

    features = dataset.data.features.copy()
    targets = dataset.data.targets.copy()

    # Combine features and targets without changing their values.
    df = pd.concat([features, targets], axis=1)

    # Basic integrity checks.
    if df.empty:
        raise ValueError("Downloaded dataset is empty.")

    if len(df) != 10000:
        raise ValueError(
            f"Expected 10,000 records, received {len(df)}."
        )

    required_columns = {
        "Type",
        "Air temperature",
        "Process temperature",
        "Rotational speed",
        "Torque",
        "Tool wear",
        "Machine failure",
        "TWF",
        "HDF",
        "PWF",
        "OSF",
        "RNF",
    }

    missing_columns = required_columns - set(df.columns)

    if missing_columns:
        raise ValueError(
            f"Missing expected columns: {missing_columns}"
        )

    # Save the raw dataset.
    df.to_csv(output_file, index=False)

    print("\nDataset downloaded successfully.")
    print(f"Records: {len(df)}")
    print(f"Columns: {len(df.columns)}")
    print(f"Saved to: {output_file}")

    print("\nColumn names:")
    print(df.columns.tolist())

    print("\nMachine failure distribution:")
    print(df["Machine failure"].value_counts().sort_index())

    print("\nMissing values:")
    print(df.isnull().sum())


if __name__ == "__main__":
    download_ai4i()
