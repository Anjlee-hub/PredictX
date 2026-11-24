
from pathlib import Path

import pandas as pd

from ml.survival.load_cmapss import load_fd001


PROJECT_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = PROJECT_ROOT / "ml" / "data" / "processed" / "cmapss"

LANDMARK_CYCLE = 30
SENSOR_COLUMNS = [f"sensor_{i}" for i in range(1, 22)]


def build_landmark_dataset(train_df, landmark_cycle=LANDMARK_CYCLE):
    """
    Build one survival observation per engine using measurements
    collected up to a fixed landmark cycle.
    """
    records = []

    for unit_id, engine in train_df.groupby("unit_id"):
        engine = engine.sort_values("cycle")

        observed = engine[engine["cycle"] <= landmark_cycle]

        # Require a complete observation window.
        if observed["cycle"].max() < landmark_cycle:
            continue

        # Use measurements available only up to the landmark.
        record = {
            "unit_id": int(unit_id),
            "landmark_cycle": landmark_cycle,
            "duration": int(
                engine["cycle"].max() - landmark_cycle
            ),
            "event": 1,
        }

        for sensor in SENSOR_COLUMNS:
            record[f"{sensor}_mean"] = observed[sensor].mean()
            record[f"{sensor}_std"] = observed[sensor].std()

        records.append(record)

    survival_df = pd.DataFrame(records)

    if survival_df.empty:
        raise ValueError("No engines have a complete landmark window.")

    if survival_df["unit_id"].duplicated().any():
        raise ValueError("Duplicate engine records detected.")

    if (survival_df["duration"] <= 0).any():
        raise ValueError("Invalid survival duration detected.")

    return survival_df


def main():
    train_df, _, _ = load_fd001()

    survival_df = build_landmark_dataset(train_df)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    output_path = OUTPUT_DIR / "fd001_survival_landmark.csv"
    survival_df.to_csv(output_path, index=False)

    feature_columns = [
        col for col in survival_df.columns
        if col not in ["unit_id", "landmark_cycle", "duration", "event"]
    ]

    print("\n--- Engine-Level Survival Dataset ---")
    print(f"Dataset shape: {survival_df.shape}")
    print(f"Number of engines: {survival_df['unit_id'].nunique()}")
    print(f"Landmark cycle: {LANDMARK_CYCLE}")
    print(f"Feature count: {len(feature_columns)}")
    print(f"Observed failures: {survival_df['event'].sum()}")

    print("\nDuration summary:")
    print(survival_df["duration"].describe())

    print("\nConstant features:")
    constant_features = [
        col for col in feature_columns
        if survival_df[col].nunique() <= 1
    ]
    print(constant_features)

    print(f"\nSaved to: {output_path}")


if __name__ == "__main__":
    main()
