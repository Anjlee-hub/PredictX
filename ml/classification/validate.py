
from pathlib import Path
import json

import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import (
    HistGradientBoostingClassifier,
    RandomForestClassifier,
)
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from ml.preprocessing.preprocess import (
    load_dataset,
    build_preprocessor,
)


PROJECT_ROOT = Path(__file__).resolve().parents[2]

ARTIFACT_DIR = (
    PROJECT_ROOT / "ml" / "artifacts" / "classification"
)
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

RANDOM_STATE = 42
TEST_SIZE = 0.15
VALIDATION_SIZE = 0.15


def get_models():
    """Return candidate classifiers."""

    return {
        "logistic_regression": LogisticRegression(
            class_weight="balanced",
            max_iter=2000,
            random_state=RANDOM_STATE,
        ),

        "random_forest": RandomForestClassifier(
            n_estimators=300,
            max_depth=None,
            min_samples_split=5,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),

        "hist_gradient_boosting": HistGradientBoostingClassifier(
            max_iter=200,
            learning_rate=0.08,
            max_leaf_nodes=15,
            l2_regularization=1.0,
            class_weight="balanced",
            random_state=RANDOM_STATE,
        ),
    }


def calculate_metrics(y_true, probabilities, threshold=0.5):
    """Calculate binary classification metrics at a threshold."""

    predictions = (probabilities >= threshold).astype(int)

    tn, fp, fn, tp = confusion_matrix(
        y_true,
        predictions,
        labels=[0, 1],
    ).ravel()

    return {
        "threshold": float(threshold),
        "accuracy": float(accuracy_score(y_true, predictions)),
        "precision": float(
            precision_score(y_true, predictions, zero_division=0)
        ),
        "recall": float(
            recall_score(y_true, predictions, zero_division=0)
        ),
        "f1_score": float(
            f1_score(y_true, predictions, zero_division=0)
        ),
        "roc_auc": float(
            roc_auc_score(y_true, probabilities)
        ),
        "pr_auc": float(
            average_precision_score(y_true, probabilities)
        ),
        "true_positives": int(tp),
        "false_positives": int(fp),
        "true_negatives": int(tn),
        "false_negatives": int(fn),
    }


def select_threshold(y_true, probabilities):
    """Select threshold that maximises validation F1."""

    thresholds = np.linspace(0.05, 0.95, 181)

    best_threshold = 0.5
    best_f1 = -1.0

    for threshold in thresholds:
        predictions = (
            probabilities >= threshold
        ).astype(int)

        score = f1_score(
            y_true,
            predictions,
            zero_division=0,
        )

        if score > best_f1:
            best_f1 = score
            best_threshold = threshold

    return float(best_threshold), float(best_f1)


def main():
    print("Loading dataset...")

    X, y = load_dataset()

    # First split: 70% training, 30% temporary.
    X_train, X_temp, y_train, y_temp = train_test_split(
        X,
        y,
        test_size=0.30,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    # Second split: divide temporary data equally.
    # Final proportions: 70% train, 15% validation, 15% test.
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

    print("\nTraining candidate models...")

    candidate_results = []
    trained_models = {}

    for model_name, classifier in get_models().items():

        print(f"\nTraining {model_name}...")

        pipeline = Pipeline(
            steps=[
                ("preprocessor", build_preprocessor()),
                ("classifier", classifier),
            ]
        )

        pipeline.fit(X_train, y_train)

        validation_probabilities = pipeline.predict_proba(
            X_validation
        )[:, 1]

        validation_metrics = calculate_metrics(
            y_validation,
            validation_probabilities,
            threshold=0.5,
        )

        candidate_results.append({
            "model": model_name,
            **validation_metrics,
        })

        trained_models[model_name] = pipeline

        print(
            "Validation PR-AUC:",
            round(validation_metrics["pr_auc"], 4),
        )

    # Select model using validation PR-AUC.
    results_df = pd.DataFrame(candidate_results)

    results_df = results_df.sort_values(
        by="pr_auc",
        ascending=False,
    )

    results_path = (
        ARTIFACT_DIR / "validation_model_comparison.csv"
    )

    results_df.to_csv(results_path, index=False)

    selected_model_name = results_df.iloc[0]["model"]
    selected_model = trained_models[selected_model_name]

    print("\nSELECTED MODEL")
    print("=" * 45)
    print(selected_model_name)

    # Tune threshold using validation data only.
    validation_probabilities = selected_model.predict_proba(
        X_validation
    )[:, 1]

    selected_threshold, validation_best_f1 = select_threshold(
        y_validation,
        validation_probabilities,
    )

    print("\nTHRESHOLD SELECTION")
    print("=" * 45)
    print("Selected threshold:", round(selected_threshold, 4))
    print("Validation F1:", round(validation_best_f1, 4))

    # Evaluate once on the untouched final test partition.
    test_probabilities = selected_model.predict_proba(
        X_test
    )[:, 1]

    test_metrics = calculate_metrics(
        y_test,
        test_probabilities,
        threshold=selected_threshold,
    )

    test_predictions = (
        test_probabilities >= selected_threshold
    ).astype(int)

    report = classification_report(
        y_test,
        test_predictions,
        labels=[0, 1],
        target_names=["No failure", "Failure"],
        output_dict=True,
        zero_division=0,
    )

    print("\nFINAL TEST RESULTS")
    print("=" * 45)

    for metric, value in test_metrics.items():
        print(f"{metric}: {value}")

    print("\nCONFUSION MATRIX")
    print(
        confusion_matrix(
            y_test,
            test_predictions,
            labels=[0, 1],
        )
    )

    # Save selected pipeline.
    model_path = ARTIFACT_DIR / "selected_model.joblib"
    joblib.dump(selected_model, model_path)

    # Save evaluation metadata.
    metadata = {
        "selected_model": selected_model_name,
        "selection_metric": "validation_pr_auc",
        "validation_pr_auc": float(
            results_df.iloc[0]["pr_auc"]
        ),
        "selected_threshold": selected_threshold,
        "threshold_selection_metric": "validation_f1",
        "validation_best_f1": validation_best_f1,
        "split": {
            "training_records": len(X_train),
            "validation_records": len(X_validation),
            "test_records": len(X_test),
            "random_state": RANDOM_STATE,
        },
        "final_test_metrics": test_metrics,
        "classification_report": report,
    }

    metadata_path = ARTIFACT_DIR / "validation_report.json"

    with open(metadata_path, "w", encoding="utf-8") as file:
        json.dump(metadata, file, indent=4)

    print("\nARTIFACTS SAVED")
    print("=" * 45)
    print(model_path)
    print(results_path)
    print(metadata_path)

    print("\nIndependent validation completed successfully.")


if __name__ == "__main__":
    main()
