
from pathlib import Path
from itertools import combinations
import json

import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from scipy.stats import spearmanr
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
RANDOM_SEEDS = [42, 52, 62, 72, 82]
MAX_EVALS = 100
RANDOM_STATE = 42


def load_test_data():
    """
    Reproduce the deterministic stratified 70/15/15 split.

    Return only the held-out test partition.
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


def generate_stability_report():
    """
    Evaluate global SHAP importance across repeated samples
    drawn from the held-out test partition.

    The model and training-only SHAP background are fixed.
    This measures sampling variability in global feature
    rankings, not model-training stability.
    """
    if len(RANDOM_SEEDS) < 2:
        raise ValueError("At least two random seeds are required.")

    if len(set(RANDOM_SEEDS)) != len(RANDOM_SEEDS):
        raise ValueError("RANDOM_SEEDS must contain unique values.")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    X_test = load_test_data()

    sample_size = min(SAMPLE_SIZE, len(X_test))

    if sample_size <= 0:
        raise ValueError("No test records are available for stability analysis.")

    explainer = load_explainer()

    run_results = []

    print("Starting SHAP stability experiment...")
    print("Number of runs:", len(RANDOM_SEEDS))
    print("Held-out test records per run:", sample_size)

    for run_number, seed in enumerate(RANDOM_SEEDS, start=1):
        print(
            f"\nRun {run_number}/{len(RANDOM_SEEDS)} "
            f"(seed={seed})"
        )

        sample = X_test.sample(
            n=sample_size,
            random_state=seed,
        )

        encoded_sample = encode_features(sample)

        shap_values = explainer(
            encoded_sample,
            max_evals=MAX_EVALS,
        )

        values = np.asarray(shap_values.values)

        expected_shape = (sample_size, len(FEATURES))

        if values.shape != expected_shape:
            raise ValueError(
                f"Unexpected SHAP shape in run {run_number}: "
                f"{values.shape}; expected {expected_shape}."
            )

        if not np.isfinite(values).all():
            raise ValueError(
                f"SHAP output contains non-finite values "
                f"in run {run_number}."
            )

        importance = np.mean(
            np.abs(values),
            axis=0,
        )

        run_results.append({
            "run": run_number,
            "seed": seed,
            **dict(zip(FEATURES, importance)),
        })

    # One row per run, one column per feature.
    run_df = pd.DataFrame(run_results)

    run_csv = OUTPUT_DIR / "shap_stability_runs.csv"

    run_df.to_csv(
        run_csv,
        index=False,
    )

    importance_matrix = run_df[FEATURES]

    mean_importance = importance_matrix.mean(axis=0)

    std_importance = importance_matrix.std(
        axis=0,
        ddof=1,
    )

    rank_matrix = importance_matrix.rank(
        axis=1,
        ascending=False,
        method="average",
    )

    mean_rank = rank_matrix.mean(axis=0)

    std_rank = rank_matrix.std(
        axis=0,
        ddof=1,
    )

    summary_df = pd.DataFrame({
        "feature": FEATURES,
        "mean_absolute_shap": mean_importance.values,
        "std_absolute_shap": std_importance.values,
        "mean_rank": mean_rank.values,
        "std_rank": std_rank.values,
    })

    summary_df = summary_df.sort_values(
        "mean_absolute_shap",
        ascending=False,
    ).reset_index(drop=True)

    summary_df.insert(
        0,
        "overall_rank",
        range(1, len(summary_df) + 1),
    )

    summary_csv = OUTPUT_DIR / "shap_stability_summary.csv"

    summary_df.to_csv(
        summary_csv,
        index=False,
    )

    # Pairwise Spearman rank correlations.
    pairwise_correlations = []

    for first, second in combinations(
        range(len(RANDOM_SEEDS)),
        2,
    ):
        correlation = spearmanr(
            rank_matrix.iloc[first],
            rank_matrix.iloc[second],
        ).statistic

        if np.isfinite(correlation):
            pairwise_correlations.append(float(correlation))
        else:
            pairwise_correlations.append(None)

    valid_correlations = [
        value
        for value in pairwise_correlations
        if value is not None
    ]

    average_correlation = (
        float(np.mean(valid_correlations))
        if valid_correlations
        else None
    )

    report = {
        "experiment": "SHAP global feature importance sampling stability",
        "evaluation_partition": "held-out test",
        "number_of_runs": len(RANDOM_SEEDS),
        "sample_size_per_run": sample_size,
        "random_seeds": RANDOM_SEEDS,
        "features": list(FEATURES),
        "average_pairwise_spearman_correlation": average_correlation,
        "pairwise_spearman_correlations": pairwise_correlations,
        "valid_correlation_count": len(valid_correlations),
        "undefined_correlation_count": (
            len(pairwise_correlations) - len(valid_correlations)
        ),
        "interpretation": (
            "Higher pairwise Spearman correlation indicates "
            "more consistent feature rankings across evaluation "
            "samples. The model and SHAP background remain fixed; "
            "this experiment does not measure model-training stability."
        ),
    }

    report_path = OUTPUT_DIR / "shap_stability_report.json"

    with open(
        report_path,
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            report,
            file,
            indent=4,
            allow_nan=False,
        )

    # Plot mean importance with standard deviation.
    plot_df = summary_df.sort_values(
        "mean_absolute_shap",
        ascending=True,
    )

    plt.figure(figsize=(10, 6))

    plt.barh(
        plot_df["feature"],
        plot_df["mean_absolute_shap"],
        xerr=plot_df["std_absolute_shap"],
        capsize=4,
    )

    plt.xlabel("Mean Absolute SHAP Value")
    plt.ylabel("Feature")
    plt.title("PredictX - SHAP Importance Stability")
    plt.tight_layout()

    plot_path = OUTPUT_DIR / "shap_stability.png"

    plt.savefig(
        plot_path,
        dpi=300,
        bbox_inches="tight",
    )

    plt.close()

    print("\nStability summary:")
    print(summary_df.to_string(index=False))

    print(
        "\nAverage pairwise Spearman correlation:",
        average_correlation,
    )

    print("\nGenerated files:")
    print(run_csv)
    print(summary_csv)
    print(report_path)
    print(plot_path)

    return {
        "run_results": run_df,
        "summary": summary_df,
        "report": report,
        "run_csv": run_csv,
        "summary_csv": summary_csv,
        "report_path": report_path,
        "plot_path": plot_path,
    }


if __name__ == "__main__":
    generate_stability_report()
