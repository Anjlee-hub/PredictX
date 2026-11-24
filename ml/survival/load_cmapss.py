
from pathlib import Path

import numpy as np
import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "ml" / "data" / "raw" / "cmapss"

RAW_COLUMNS = (
    ["unit_id", "cycle"]
    + [f"setting_{i}" for i in range(1, 4)]
    + [f"sensor_{i}" for i in range(1, 22)]
)


def _read_txt(path: Path) -> pd.DataFrame:
    """Read a whitespace-separated C-MAPSS data file."""
    if not path.exists():
        raise FileNotFoundError(f"Dataset file not found: {path}")

    df = pd.read_csv(path, sep=r"\s+", header=None)

    if df.shape[1] != len(RAW_COLUMNS):
        raise ValueError(
            f"{path.name}: expected 26 columns, found {df.shape[1]}"
        )

    df.columns = RAW_COLUMNS

    if df.isnull().any().any():
        raise ValueError(f"{path.name} contains missing values.")

    if not np.isfinite(df.to_numpy(dtype=float)).all():
        raise ValueError(f"{path.name} contains non-finite values.")

    return df


def load_fd001(data_dir: Path = DATA_DIR):
    """
    Load NASA C-MAPSS FD001 training, test and RUL datasets.

    Returns:
        train_df: Training observations with derived row-level RUL.
        test_df: Test observations without fabricated failure labels.
        test_rul_df: True RUL labels for each test engine.
    """
    train_df = _read_txt(data_dir / "train_FD001.txt")
    test_df = _read_txt(data_dir / "test_FD001.txt")

    rul_path = data_dir / "RUL_FD001.txt"

    if not rul_path.exists():
        raise FileNotFoundError(f"Dataset file not found: {rul_path}")

    rul_values = pd.read_csv(rul_path, sep=r"\s+", header=None)

    if rul_values.shape[1] != 1:
        raise ValueError("RUL_FD001.txt must contain exactly one column.")

    # Training engines run until failure.
    max_cycles = train_df.groupby("unit_id")["cycle"].transform("max")
    train_df["RUL"] = max_cycles - train_df["cycle"]

    # Test engines are incomplete trajectories.
    # RUL labels correspond to each engine's final observed cycle.
    test_engine_ids = sorted(test_df["unit_id"].unique())

    if len(test_engine_ids) != len(rul_values):
        raise ValueError(
            "Number of test engines does not match number of RUL labels."
        )

    test_rul_df = pd.DataFrame({
        "unit_id": test_engine_ids,
        "RUL": rul_values.iloc[:, 0].to_numpy()
    })

    # Structural validation.
    for name, df in [("train", train_df), ("test", test_df)]:
        if (df["cycle"] <= 0).any():
            raise ValueError(f"{name} contains invalid cycle values.")

        if df.duplicated(["unit_id", "cycle"]).any():
            raise ValueError(f"{name} contains duplicate engine-cycle rows.")

        if not df.groupby("unit_id")["cycle"].apply(
            lambda cycles: cycles.is_monotonic_increasing
        ).all():
            raise ValueError(f"{name} has non-increasing engine cycles.")

    return train_df, test_df, test_rul_df


if __name__ == "__main__":
    train, test, test_rul = load_fd001()

    print("\n--- NASA C-MAPSS FD001 ---")
    print(f"Training shape: {train.shape}")
    print(f"Test shape: {test.shape}")
    print(f"Test RUL shape: {test_rul.shape}")

    print(f"\nTraining engines: {train['unit_id'].nunique()}")
    print(f"Test engines: {test['unit_id'].nunique()}")

    print("\nTraining sample:")
    print(train.head())

    print("\nTest RUL sample:")
    print(test_rul.head())

    print("\nTraining RUL summary:")
    print(train["RUL"].describe())
