
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from lifelines import CoxPHFitter
from lifelines.utils import concordance_index
from sklearn.preprocessing import StandardScaler


PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_DIR = PROJECT_ROOT / "ml" / "data" / "processed" / "cmapss"
ARTIFACT_DIR = PROJECT_ROOT / "ml" / "artifacts" / "survival"

TRAIN_PATH = DATA_DIR / "cox_train.csv"
TEST_PATH = DATA_DIR / "cox_test.csv"

MODEL_PATH = ARTIFACT_DIR / "cox_ph_model.joblib"
SCALER_PATH = ARTIFACT_DIR / "cox_scaler.joblib"
METRICS_PATH = ARTIFACT_DIR / "cox_metrics.json"

TARGET_COLUMNS = [
    "unit_id",
    "landmark_cycle",
    "duration",
    "event",
]

PENALIZER = 0.1


def load_data():
    if not TRAIN_PATH.exists() or not TEST_PATH.exists():
        raise FileNotFoundError(
            "Cox training/test datasets not found. "
            "Run python -m ml.survival.prepare_cox_data first."
        )

    train_df = pd.read_csv(TRAIN_PATH)
    test_df = pd.read_csv(TEST_PATH)

    if list(train_df.columns) != list(test_df.columns):
        raise ValueError("Training and test feature schemas differ.")

    return train_df, test_df


def prepare_features(train_df, test_df):
    feature_columns = [
        col for col in train_df.columns
        if col not in TARGET_COLUMNS
    ]

    X_train = train_df[feature_columns].astype(float)
    X_test = test_df[feature_columns].astype(float)

    if not np.isfinite(X_train.to_numpy()).all():
        raise ValueError("Training features contain non-finite values.")

    if not np.isfinite(X_test.to_numpy()).all():
        raise ValueError("Test features contain non-finite values.")

    scaler = StandardScaler()

    X_train_scaled = pd.DataFrame(
        scaler.fit_transform(X_train),
        columns=feature_columns,
        index=train_df.index,
    )

    X_test_scaled = pd.DataFrame(
        scaler.transform(X_test),
        columns=feature_columns,
        index=test_df.index,
    )

    return X_train_scaled, X_test_scaled, scaler, feature_columns


def calculate_c_index(model, df, features):
    model_input = df[["duration", "event"]].copy()

    model_input[features] = df[features].to_numpy()

    risk_scores = model.predict_partial_hazard(
        model_input[features]
    ).to_numpy().ravel()

    # Higher risk means shorter predicted survival.
    # Negate risk so higher scores correspond to longer survival.
    return float(
        concordance_index(
            df["duration"],
            -risk_scores,
            df["event"],
        )
    )


def train():
    train_df, test_df = load_data()

    X_train, X_test, scaler, feature_columns = prepare_features(
        train_df,
        test_df,
    )

    train_model_df = pd.concat(
        [
            train_df[["duration", "event"]].reset_index(drop=True),
            X_train.reset_index(drop=True),
        ],
        axis=1,
    )

    test_model_df = pd.concat(
        [
            test_df[["duration", "event"]].reset_index(drop=True),
            X_test.reset_index(drop=True),
        ],
        axis=1,
    )

    model = CoxPHFitter(
        penalizer=PENALIZER,
        l1_ratio=0.0,
    )

    model.fit(
        train_model_df,
        duration_col="duration",
        event_col="event",
        show_progress=True,
    )

    train_c_index = calculate_c_index(
        model,
        train_model_df,
        feature_columns,
    )

    test_c_index = calculate_c_index(
        model,
        test_model_df,
        feature_columns,
    )

    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    metrics = {
        "model": "Cox Proportional Hazards",
        "dataset": "NASA C-MAPSS FD001",
        "landmark_cycle": 30,
        "training_engines": int(len(train_df)),
        "test_engines": int(len(test_df)),
        "feature_count": len(feature_columns),
        "penalizer": PENALIZER,
        "l1_ratio": 0.0,
        "train_concordance_index": train_c_index,
        "test_concordance_index": test_c_index,
        "event_observations_train": int(train_df["event"].sum()),
        "event_observations_test": int(test_df["event"].sum()),
        "censoring_observations_train": int(
            (train_df["event"] == 0).sum()
        ),
        "censoring_observations_test": int(
            (test_df["event"] == 0).sum()
        ),
    }

    with open(METRICS_PATH, "w", encoding="utf-8") as file:
        json.dump(metrics, file, indent=4)

    print("\n--- Cox PH Model Results ---")
    print(f"Training C-index: {train_c_index:.4f}")
    print(f"Test C-index: {test_c_index:.4f}")
    print(f"Features: {len(feature_columns)}")
    print(f"Penalizer: {PENALIZER}")

    print("\nTop model coefficients:")
    print(
        model.summary[
            ["coef", "exp(coef)", "p", "se(coef)"]
        ].sort_values(
            by="coef",
            key=lambda values: values.abs(),
            ascending=False,
        ).head(10)
    )

    print("\nArtifacts saved:")
    print(MODEL_PATH)
    print(SCALER_PATH)
    print(METRICS_PATH)

    return model, metrics


if __name__ == "__main__":
    train()
