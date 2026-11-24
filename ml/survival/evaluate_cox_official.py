
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from lifelines import CoxPHFitter
from lifelines.utils import concordance_index
from sklearn.preprocessing import StandardScaler

from ml.survival.load_cmapss import load_fd001
from ml.survival.prepare_cox_data import (
    remove_constant_features,
    remove_correlated_features,
)


PROJECT_ROOT = Path(__file__).resolve().parents[2]

LANDMARK_PATH = (
    PROJECT_ROOT
    / "ml"
    / "data"
    / "processed"
    / "cmapss"
    / "fd001_survival_landmark.csv"
)

ARTIFACT_DIR = (
    PROJECT_ROOT
    / "ml"
    / "artifacts"
    / "survival"
)

LANDMARK_CYCLE = 30

# Chosen by frequency in the nested-CV inner loops.
# This is a final-fit choice, not a claim of universal optimality.
PENALIZER = 2.0

SENSOR_COLUMNS = [
    f"sensor_{i}" for i in range(1, 22)
]

TARGET_COLUMNS = [
    "unit_id",
    "landmark_cycle",
    "duration",
    "event",
]


def build_official_test_landmark(test_df, test_rul_df):
    """
    Build official test features from cycles 1-30.

    NASA's supplied RUL labels refer to each engine's final
    observed cycle. Convert them to RUL at cycle 30.
    """

    records = []

    for unit_id, engine in test_df.groupby("unit_id"):
        engine = engine.sort_values("cycle")

        observed = engine[
            engine["cycle"] <= LANDMARK_CYCLE
        ].copy()

        expected_cycles = list(
            range(1, LANDMARK_CYCLE + 1)
        )

        actual_cycles = observed["cycle"].astype(int).tolist()

        if actual_cycles != expected_cycles:
            raise ValueError(
                f"Engine {unit_id} does not have a complete "
                f"cycle 1-{LANDMARK_CYCLE} observation window."
            )

        last_observed_cycle = int(engine["cycle"].max())

        records.append({
            "unit_id": int(unit_id),
            "landmark_cycle": LANDMARK_CYCLE,
            "last_observed_cycle": last_observed_cycle,
            **{
                f"{sensor}_mean": observed[sensor].mean()
                for sensor in SENSOR_COLUMNS
            },
            **{
                f"{sensor}_std": observed[sensor].std()
                for sensor in SENSOR_COLUMNS
            },
        })

    features_df = pd.DataFrame(records)

    if features_df.empty:
        raise ValueError("No official test landmark records created.")

    if features_df["unit_id"].duplicated().any():
        raise ValueError("Duplicate official test engine records.")

    # NASA RUL labels correspond to the final observed cycle.
    labels = test_rul_df.copy()

    if labels["unit_id"].duplicated().any():
        raise ValueError("Duplicate NASA RUL labels.")

    evaluation_df = features_df.merge(
        labels,
        on="unit_id",
        how="inner",
        validate="one_to_one",
    )

    if len(evaluation_df) != len(test_df["unit_id"].unique()):
        raise ValueError(
            "Some official test engines could not be matched to RUL labels."
        )

    # Convert final-observation RUL to landmark-cycle RUL.
    evaluation_df["true_rul_at_landmark"] = (
        evaluation_df["last_observed_cycle"]
        - LANDMARK_CYCLE
        + evaluation_df["RUL"]
    )

    if (evaluation_df["true_rul_at_landmark"] <= 0).any():
        raise ValueError("Invalid landmark RUL values detected.")

    return evaluation_df


def evaluate_official_test():

    if not LANDMARK_PATH.exists():
        raise FileNotFoundError(
            f"Training landmark dataset not found: {LANDMARK_PATH}"
        )

    # Load the complete NASA training and official test datasets.
    train_df, official_test_df, official_rul_df = load_fd001()

    # Training observations: one row per training engine.
    landmark_train = pd.read_csv(LANDMARK_PATH)

    if landmark_train["unit_id"].duplicated().any():
        raise ValueError("Duplicate training landmark records.")

    if not (landmark_train["event"] == 1).all():
        raise ValueError(
            "Expected all training landmark records to have event=1."
        )

    # Build official test features using the same landmark.
    official_test = build_official_test_landmark(
        official_test_df,
        official_rul_df,
    )

    feature_candidates = [
        column
        for column in landmark_train.columns
        if column not in TARGET_COLUMNS
    ]

    X_train = landmark_train[feature_candidates].astype(float)
    X_test = official_test[feature_candidates].astype(float)

    if not np.isfinite(X_train.to_numpy()).all():
        raise ValueError("Training features contain non-finite values.")

    if not np.isfinite(X_test.to_numpy()).all():
        raise ValueError("Official test features contain non-finite values.")

    # Fit feature selection using training engines only.
    non_constant = remove_constant_features(X_train)

    X_train = X_train[non_constant]
    X_test = X_test[non_constant]

    selected_features, removed_correlated = (
        remove_correlated_features(
            X_train,
            threshold=0.95,
        )
    )

    X_train = X_train[selected_features]
    X_test = X_test[selected_features]

    # Fit scaling using training engines only.
    scaler = StandardScaler()

    X_train_scaled = pd.DataFrame(
        scaler.fit_transform(X_train),
        columns=selected_features,
    )

    X_test_scaled = pd.DataFrame(
        scaler.transform(X_test),
        columns=selected_features,
    )

    # Build Cox training dataframe.
    train_model_df = pd.concat(
        [
            landmark_train[["duration", "event"]].reset_index(drop=True),
            X_train_scaled.reset_index(drop=True),
        ],
        axis=1,
    )

    # Fit on all 100 training engines.
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

    # Calculate relative risk for official test engines.
    risk_scores = model.predict_partial_hazard(
        X_test_scaled[selected_features]
    ).to_numpy().ravel()

    true_rul = official_test[
        "true_rul_at_landmark"
    ].to_numpy()

    # All official test RUL labels provide exact failure-time
    # ground truth, although failure was not observed in the
    # sensor trajectory itself.
    event_observed = np.ones(
        len(official_test),
        dtype=int,
    )

    test_c_index = float(
        concordance_index(
            true_rul,
            -risk_scores,
            event_observed,
        )
    )

    # Save predictions and ground-truth comparisons.
    predictions = pd.DataFrame({
        "unit_id": official_test["unit_id"],
        "landmark_cycle": LANDMARK_CYCLE,
        "last_observed_cycle": official_test["last_observed_cycle"],
        "true_rul_at_landmark": true_rul,
        "predicted_relative_risk": risk_scores,
    })

    # Higher predicted risk means shorter remaining useful life.
    predictions["risk_rank"] = (
        predictions["predicted_relative_risk"]
        .rank(method="average", ascending=False)
        .astype(int)
    )

    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

    model_path = ARTIFACT_DIR / "official_test_cox_model.joblib"
    scaler_path = ARTIFACT_DIR / "official_test_cox_scaler.joblib"
    predictions_path = ARTIFACT_DIR / "official_test_cox_predictions.csv"
    metrics_path = ARTIFACT_DIR / "official_test_cox_metrics.json"
    features_path = ARTIFACT_DIR / "official_test_cox_features.json"

    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)

    predictions.to_csv(
        predictions_path,
        index=False,
    )

    with open(features_path, "w", encoding="utf-8") as file:
        json.dump(
            {
                "selected_features": selected_features,
                "removed_constant_features": [
                    col for col in feature_candidates
                    if col not in non_constant
                ],
                "removed_correlated_features": removed_correlated,
            },
            file,
            indent=4,
        )

    metrics = {
        "model": "Cox Proportional Hazards",
        "dataset": "NASA C-MAPSS FD001",
        "evaluation": "Official NASA test set",
        "landmark_cycle": LANDMARK_CYCLE,
        "training_engines": int(len(landmark_train)),
        "official_test_engines": int(len(official_test)),
        "candidate_features": int(len(feature_candidates)),
        "selected_features": int(len(selected_features)),
        "penalizer": PENALIZER,
        "l1_ratio": 0.0,
        "official_test_concordance_index": test_c_index,
        "training_event_observations": int(
            landmark_train["event"].sum()
        ),
        "official_test_exact_rul_labels": int(len(true_rul)),
        "official_test_rul_min": float(np.min(true_rul)),
        "official_test_rul_max": float(np.max(true_rul)),
        "evaluation_note": (
            "Official test RUL labels provide exact failure-time "
            "ground truth at the landmark after alignment. "
            "They are not sensor-observed failure events."
        ),
    }

    with open(metrics_path, "w", encoding="utf-8") as file:
        json.dump(metrics, file, indent=4)

    print("\n========== OFFICIAL NASA TEST EVALUATION ==========")
    print(f"Training engines: {len(landmark_train)}")
    print(f"Official test engines: {len(official_test)}")
    print(f"Landmark cycle: {LANDMARK_CYCLE}")
    print(f"Candidate features: {len(feature_candidates)}")
    print(f"Selected features: {len(selected_features)}")
    print(f"Penalizer: {PENALIZER}")

    print(
        f"\nOfficial NASA test C-index: "
        f"{test_c_index:.4f}"
    )

    print("\nRUL at landmark summary:")
    print(
        official_test["true_rul_at_landmark"].describe()
    )

    print("\nSaved artifacts:")
    print(model_path)
    print(scaler_path)
    print(predictions_path)
    print(metrics_path)
    print(features_path)

    return model, metrics, predictions


if __name__ == "__main__":
    evaluate_official_test()
