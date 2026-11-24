
from pathlib import Path
import json

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import (
    confusion_matrix,
    precision_score,
    recall_score,
    f1_score,
)
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
CURRENT_THRESHOLD = 0.705


def get_model():
    return HistGradientBoostingClassifier(
        max_iter=200,
        learning_rate=0.08,
        max_leaf_nodes=15,
        l2_regularization=1.0,
        class_weight="balanced",
        random_state=RANDOM_STATE,
    )


def calculate_threshold_metrics(y_true, probabilities, threshold):

    predictions = (
        probabilities >= threshold
    ).astype(int)

    tn, fp, fn, tp = confusion_matrix(
        y_true,
        predictions,
        labels=[0, 1],
    ).ravel()

    return {
        "threshold": float(threshold),
        "precision": float(
            precision_score(
                y_true, predictions, zero_division=0
            )
        ),
        "recall": float(
            recall_score(
                y_true, predictions, zero_division=0
            )
        ),
        "f1_score": float(
            f1_score(
                y_true, predictions, zero_division=0
            )
        ),
        "true_positives": int(tp),
        "false_positives": int(fp),
        "true_negatives": int(tn),
        "false_negatives": int(fn),
    }


def main():

    print("Loading dataset...")

    X, y = load_dataset()

    # Reproduce the existing 70/15/15 split.
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
    print("Reserved test records:", len(X_test))

    pipeline = Pipeline(
        steps=[
            ("preprocessor", build_preprocessor()),
            ("classifier", get_model()),
        ]
    )

    print("\nTraining HistGradientBoosting...")

    pipeline.fit(X_train, y_train)

    probabilities = pipeline.predict_proba(
        X_validation
    )[:, 1]

    # Original threshold sweep plus explicit current threshold.
    thresholds = np.unique(
        np.append(
            np.linspace(0.05, 0.95, 181),
            CURRENT_THRESHOLD,
        )
    )

    results = []

    for threshold in thresholds:
        results.append(
            calculate_threshold_metrics(
                y_validation,
                probabilities,
                threshold,
            )
        )

    results_df = pd.DataFrame(results)

    # Save all threshold results.
    csv_path = (
        ARTIFACT_DIR / "threshold_sensitivity.csv"
    )

    results_df.to_csv(csv_path, index=False)

    # Identify the best F1 threshold on validation.
    best_row = results_df.loc[
        results_df["f1_score"].idxmax()
    ]

    # Retrieve the current 0.705 threshold.
    current_row = results_df.loc[
        np.isclose(
            results_df["threshold"],
            CURRENT_THRESHOLD,
        )
    ].iloc[0]

    print("\nCURRENT THRESHOLD RESULTS")
    print("=" * 45)
    print(current_row.to_string())

    print("\nBEST VALIDATION F1 RESULT")
    print("=" * 45)
    print(best_row.to_string())

    print("\nTHRESHOLD COMPARISON")
    print("=" * 45)

    comparison = results_df[
        results_df["threshold"].isin(
            [0.30, 0.40, 0.50, 0.60, 0.705, 0.80]
        )
    ]

    print(comparison.round(4).to_string(index=False))

    # Plot precision, recall and F1 across thresholds.
    plt.figure(figsize=(10, 6))

    plt.plot(
        results_df["threshold"],
        results_df["precision"],
        label="Precision",
    )

    plt.plot(
        results_df["threshold"],
        results_df["recall"],
        label="Recall",
    )

    plt.plot(
        results_df["threshold"],
        results_df["f1_score"],
        label="F1 score",
    )

    plt.axvline(
        CURRENT_THRESHOLD,
        linestyle="--",
        label="Current threshold (0.705)",
    )

    plt.xlabel("Decision threshold")
    plt.ylabel("Metric score")
    plt.title("Classification Threshold Sensitivity")
    plt.legend()
    plt.grid(alpha=0.3)
    plt.tight_layout()

    plot_path = (
        ARTIFACT_DIR / "threshold_sensitivity.png"
    )

    plt.savefig(plot_path, dpi=300)
    plt.close()

    # Save summary separately.
    summary = {
        "model": "hist_gradient_boosting",
        "evaluation_partition": "validation",
        "current_threshold": CURRENT_THRESHOLD,
        "current_threshold_metrics": (
            current_row.to_dict()
        ),
        "best_validation_f1_threshold": float(
            best_row["threshold"]
        ),
        "best_validation_f1": float(
            best_row["f1_score"]
        ),
        "validation_records": len(X_validation),
        "reserved_test_records": len(X_test),
    }

    summary_path = (
        ARTIFACT_DIR / "threshold_sensitivity_report.json"
    )

    with open(
        summary_path,
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(summary, file, indent=4)

    print("\nARTIFACTS SAVED")
    print("=" * 45)
    print(csv_path)
    print(plot_path)
    print(summary_path)

    print("\nThreshold sensitivity analysis completed.")


if __name__ == "__main__":
    main()
