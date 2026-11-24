
from pathlib import Path
import json

import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from sklearn.calibration import calibration_curve
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import brier_score_loss, log_loss
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from ml.preprocessing.preprocess import (
    load_dataset,
    build_preprocessor,
)


PROJECT_ROOT = Path(__file__).resolve().parents[2]

ARTIFACT_DIR = (
    PROJECT_ROOT
    / "ml"
    / "artifacts"
    / "classification"
)

ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

RANDOM_STATE = 42


def get_selected_model():
    """Return the selected HistGradientBoosting classifier."""

    return HistGradientBoostingClassifier(
        max_iter=200,
        learning_rate=0.08,
        max_leaf_nodes=15,
        l2_regularization=1.0,
        class_weight="balanced",
        random_state=RANDOM_STATE,
    )


def main():

    print("Loading dataset...")

    X, y = load_dataset()

    # Reproduce the exact 70/15/15 split from validate.py.
    X_train, X_temp, y_train, y_temp = train_test_split(
        X,
        y,
        test_size=0.30,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    X_validation, X_test, y_validation, y_test = (
        train_test_split(
            X_temp,
            y_temp,
            test_size=0.50,
            random_state=RANDOM_STATE,
            stratify=y_temp,
        )
    )

    print("\nDATA PARTITION")
    print("=" * 45)
    print("Training records:", len(X_train))
    print("Validation records:", len(X_validation))
    print("Final test records:", len(X_test))

    # Train only on the training partition.
    pipeline = Pipeline(
        steps=[
            ("preprocessor", build_preprocessor()),
            ("classifier", get_selected_model()),
        ]
    )

    print("\nTraining selected model...")

    pipeline.fit(X_train, y_train)

    # Calibration diagnostics use validation data only.
    probabilities = pipeline.predict_proba(
        X_validation
    )[:, 1]

    brier = brier_score_loss(
        y_validation,
        probabilities,
    )

    loss = log_loss(
        y_validation,
        probabilities,
        labels=[0, 1],
    )

    print("\nCALIBRATION METRICS")
    print("=" * 45)
    print("Brier score:", round(brier, 6))
    print("Log loss:", round(loss, 6))

    # Calculate calibration curve.
    fraction_positive, mean_predicted = calibration_curve(
        y_validation,
        probabilities,
        n_bins=10,
        strategy="uniform",
    )

    # Save calibration curve.
    plt.figure(figsize=(8, 6))

    plt.plot(
        mean_predicted,
        fraction_positive,
        marker="o",
        label="HistGradientBoosting",
    )

    plt.plot(
        [0, 1],
        [0, 1],
        linestyle="--",
        label="Perfect calibration",
    )

    plt.xlabel("Mean predicted failure score")
    plt.ylabel("Observed failure frequency")
    plt.title("Probability Calibration Curve")
    plt.legend()
    plt.grid(alpha=0.3)
    plt.tight_layout()

    calibration_path = (
        ARTIFACT_DIR / "calibration_curve.png"
    )

    plt.savefig(calibration_path, dpi=300)
    plt.close()

    # Probability distribution.
    plt.figure(figsize=(8, 6))

    plt.hist(
        probabilities,
        bins=20,
        edgecolor="black",
    )

    plt.xlabel("Predicted failure score")
    plt.ylabel("Number of records")
    plt.title("Predicted Failure Score Distribution")
    plt.grid(alpha=0.3)
    plt.tight_layout()

    distribution_path = (
        ARTIFACT_DIR / "probability_distribution.png"
    )

    plt.savefig(distribution_path, dpi=300)
    plt.close()

    # Save diagnostic values.
    report = {
        "model": "hist_gradient_boosting",
        "dataset": "AI4I 2020",
        "evaluation_partition": "validation",
        "training_records": len(X_train),
        "validation_records": len(X_validation),
        "reserved_test_records": len(X_test),
        "validation_failure_count": int(
            y_validation.sum()
        ),
        "brier_score": float(brier),
        "log_loss": float(loss),
        "probability_mean": float(
            np.mean(probabilities)
        ),
        "probability_std": float(
            np.std(probabilities)
        ),
        "probability_min": float(
            np.min(probabilities)
        ),
        "probability_max": float(
            np.max(probabilities)
        ),
    }

    report_path = (
        ARTIFACT_DIR / "calibration_report.json"
    )

    with open(
        report_path,
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(report, file, indent=4)

    print("\nARTIFACTS SAVED")
    print("=" * 45)
    print(report_path)
    print(calibration_path)
    print(distribution_path)

    print("\nCalibration diagnostics completed.")


if __name__ == "__main__":
    main()
