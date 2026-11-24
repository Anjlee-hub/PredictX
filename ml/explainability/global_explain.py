
from pathlib import Path

import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import shap
from sklearn.model_selection import train_test_split

from ml.preprocessing.preprocess import load_dataset
from ml.explainability.explain import (
    FEATURES,
    encode_features,
    load_explainer,
)


PROJECT_ROOT = Path(__file__).resolve().parents[2]

OUTPUT_DIR = (
    PROJECT_ROOT
    / "ml"
    / "artifacts"
    / "explainability"
)

SAMPLE_SIZE = 100
MAX_EVALS = 100
RANDOM_STATE = 42


def load_test_data():
    """
    Reproduce the deterministic stratified 70/15/15 split.

    Only the held-out test partition is returned.
    The training and validation partitions are excluded.
    """
    X, y = load_dataset()

    _, X_temp, _, y_temp = train_test_split(
        X,
        y,
        test_size=0.30,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    _, X_test, _, _ = train_test_split(
        X_temp,
        y_temp,
        test_size=0.50,
        random_state=RANDOM_STATE,
        stratify=y_temp,
    )

    if X_test.empty:
        raise ValueError("The held-out test partition is empty.")

    return X_test


def generate_global_explanations():
    """
    Generate global SHAP importance using held-out test records.

    The SHAP explainer uses the training-only background
    configured in explain.py.
    """
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    X_test = load_test_data()

    sample_size = min(SAMPLE_SIZE, len(X_test))

    if sample_size <= 0:
        raise ValueError("No test records are available for explanation.")

    sample = X_test.sample(
        n=sample_size,
        random_state=RANDOM_STATE,
    )

    encoded_sample = encode_features(sample)

    explainer = load_explainer()

    print(f"Explaining {sample_size} held-out test records...")
    print("This may take some time.")

    shap_values = explainer(
        encoded_sample,
        max_evals=MAX_EVALS,
    )

    values = np.asarray(shap_values.values)

    expected_shape = (sample_size, len(FEATURES))

    if values.shape != expected_shape:
        raise ValueError(
            f"Unexpected SHAP output shape: {values.shape}; "
            f"expected {expected_shape}."
        )

    if not np.isfinite(values).all():
        raise ValueError("SHAP output contains non-finite values.")

    mean_absolute = np.mean(np.abs(values), axis=0)
    mean_signed = np.mean(values, axis=0)

    importance_df = pd.DataFrame({
        "feature": FEATURES,
        "mean_absolute_shap": mean_absolute,
        "mean_shap": mean_signed,
    })

    importance_df = importance_df.sort_values(
        by="mean_absolute_shap",
        ascending=False,
    ).reset_index(drop=True)

    importance_df.insert(
        0,
        "rank",
        range(1, len(importance_df) + 1),
    )

    csv_path = OUTPUT_DIR / "global_feature_importance.csv"

    importance_df.to_csv(
        csv_path,
        index=False,
    )

    # Global feature importance bar chart.
    sorted_df = importance_df.sort_values(
        "mean_absolute_shap",
        ascending=True,
    )

    plt.figure(figsize=(10, 6))

    plt.barh(
        sorted_df["feature"],
        sorted_df["mean_absolute_shap"],
    )

    plt.xlabel("Mean Absolute SHAP Value")
    plt.ylabel("Sensor Feature")
    plt.title("PredictX - Global Feature Importance")
    plt.tight_layout()

    bar_path = OUTPUT_DIR / "global_feature_importance.png"

    plt.savefig(
        bar_path,
        dpi=300,
        bbox_inches="tight",
    )

    plt.close()

    # SHAP summary / beeswarm plot.
    plt.figure(figsize=(10, 6))

    shap.summary_plot(
        values,
        encoded_sample,
        feature_names=FEATURES,
        show=False,
    )

    plt.title("PredictX - SHAP Summary Plot")
    plt.tight_layout()

    summary_path = OUTPUT_DIR / "shap_summary.png"

    plt.savefig(
        summary_path,
        dpi=300,
        bbox_inches="tight",
    )

    plt.close()

    print("\nGlobal SHAP importance:")
    print(importance_df.to_string(index=False))

    print("\nGenerated files:")
    print(csv_path)
    print(bar_path)
    print(summary_path)

    return {
        "importance": importance_df,
        "shap_values": values,
        "sample_size": sample_size,
        "csv_path": csv_path,
        "bar_plot_path": bar_path,
        "summary_plot_path": summary_path,
    }


if __name__ == "__main__":
    generate_global_explanations()
