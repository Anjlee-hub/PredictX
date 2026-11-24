
from pathlib import Path
import json

import joblib
import pandas as pd

from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import (
    RandomForestClassifier,
    HistGradientBoostingClassifier,
)
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
)

from ml.preprocessing.preprocess import (
    load_dataset,
    build_preprocessor,
)

PROJECT_ROOT = Path(__file__).resolve().parents[2]

ARTIFACT_DIR = PROJECT_ROOT / "ml" / "artifacts"
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

RANDOM_STATE = 42


def get_models():
    """Define candidate classification algorithms."""

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


def evaluate_model(model, X_test, y_test):
    """Calculate classification metrics."""

    predictions = model.predict(X_test)
    probabilities = model.predict_proba(X_test)[:, 1]

    return {
        "accuracy": accuracy_score(y_test, predictions),
        "precision": precision_score(
            y_test, predictions, zero_division=0
        ),
        "recall": recall_score(
            y_test, predictions, zero_division=0
        ),
        "f1_score": f1_score(
            y_test, predictions, zero_division=0
        ),
        "roc_auc": roc_auc_score(y_test, probabilities),
        "pr_auc": average_precision_score(
            y_test, probabilities
        ),
    }


def main():
    print("Loading dataset...")

    X, y = load_dataset()

    from sklearn.model_selection import train_test_split

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    results = []
    trained_models = {}

    print("\nTraining classification models...")

    for model_name, classifier in get_models().items():

        print(f"\nTraining {model_name}...")

        pipeline = Pipeline(
            steps=[
                ("preprocessor", build_preprocessor()),
                ("classifier", classifier),
            ]
        )

        pipeline.fit(X_train, y_train)

        metrics = evaluate_model(
            pipeline,
            X_test,
            y_test,
        )

        metrics["model"] = model_name

        results.append(metrics)
        trained_models[model_name] = pipeline

        print("Evaluation:")
        for metric, value in metrics.items():
            if metric != "model":
                print(f"{metric}: {value:.4f}")

    results_df = pd.DataFrame(results)

    results_df = results_df[
        [
            "model",
            "accuracy",
            "precision",
            "recall",
            "f1_score",
            "roc_auc",
            "pr_auc",
        ]
    ]

    results_path = ARTIFACT_DIR / "model_comparison.csv"
    results_df.to_csv(results_path, index=False)

    # Save each complete pipeline.
    for model_name, model in trained_models.items():
        joblib.dump(
            model,
            ARTIFACT_DIR / f"{model_name}.joblib",
        )

    metrics_path = ARTIFACT_DIR / "model_metrics.json"

    with open(metrics_path, "w", encoding="utf-8") as file:
        json.dump(results, file, indent=4)

    print("\nMODEL COMPARISON")
    print("=" * 70)
    print(results_df.to_string(index=False))

    print("\nSaved model artifacts to:", ARTIFACT_DIR)
    print("Training and evaluation completed.")


if __name__ == "__main__":
    main()
