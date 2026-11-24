
from pathlib import Path

import numpy as np
import pandas as pd

from lifelines import CoxPHFitter
from lifelines.utils import concordance_index
from sklearn.model_selection import KFold
from sklearn.preprocessing import StandardScaler

from ml.survival.prepare_cox_data import (
    remove_constant_features,
    remove_correlated_features,
)


PROJECT_ROOT = Path(__file__).resolve().parents[2]

INPUT_PATH = (
    PROJECT_ROOT
    / "ml"
    / "data"
    / "processed"
    / "cmapss"
    / "fd001_survival_landmark.csv"
)

OUTPUT_DIR = (
    PROJECT_ROOT
    / "ml"
    / "artifacts"
    / "survival"
)

TARGET_COLUMNS = [
    "unit_id",
    "landmark_cycle",
    "duration",
    "event",
]

PENALTIES = [0.01, 0.1, 0.5, 1.0, 2.0]

OUTER_SPLITS = 5
INNER_SPLITS = 3


def prepare_fold_data(X_train, X_val):
    """
    Fit feature selection and scaling on training data only.
    Apply the fitted selections and scaler to validation data.
    """

    non_constant = remove_constant_features(X_train)

    X_train = X_train[non_constant]
    X_val = X_val[non_constant]

    selected, _ = remove_correlated_features(
        X_train,
        threshold=0.95,
    )

    X_train = X_train[selected]
    X_val = X_val[selected]

    scaler = StandardScaler()

    X_train_scaled = pd.DataFrame(
        scaler.fit_transform(X_train),
        columns=selected,
    )

    X_val_scaled = pd.DataFrame(
        scaler.transform(X_val),
        columns=selected,
    )

    return X_train_scaled, X_val_scaled, selected


def fit_and_score(
    X_train,
    y_train,
    X_val,
    y_val,
    penalty,
):
    """
    Fit a Cox PH model and calculate validation C-index.
    """

    X_train_scaled, X_val_scaled, selected = prepare_fold_data(
        X_train,
        X_val,
    )

    train_df = pd.concat(
        [
            y_train.reset_index(drop=True),
            X_train_scaled.reset_index(drop=True),
        ],
        axis=1,
    )

    val_df = pd.concat(
        [
            y_val.reset_index(drop=True),
            X_val_scaled.reset_index(drop=True),
        ],
        axis=1,
    )

    model = CoxPHFitter(
        penalizer=penalty,
        l1_ratio=0.0,
    )

    model.fit(
        train_df,
        duration_col="duration",
        event_col="event",
    )

    risk = model.predict_partial_hazard(
        val_df[selected]
    ).to_numpy().ravel()

    score = concordance_index(
        val_df["duration"],
        -risk,
        val_df["event"],
    )

    return float(score), len(selected)


def run_nested_cross_validation():

    data = pd.read_csv(INPUT_PATH)

    X = data.drop(columns=TARGET_COLUMNS)
    y = data[["duration", "event"]]

    outer_cv = KFold(
        n_splits=OUTER_SPLITS,
        shuffle=True,
        random_state=42,
    )

    outer_results = []
    inner_results = []

    for outer_fold, (outer_train_idx, outer_val_idx) in enumerate(
        outer_cv.split(X),
        start=1,
    ):

        print(f"\n========== OUTER FOLD {outer_fold} ==========")

        X_outer_train = X.iloc[outer_train_idx].copy()
        X_outer_val = X.iloc[outer_val_idx].copy()

        y_outer_train = y.iloc[outer_train_idx].copy()
        y_outer_val = y.iloc[outer_val_idx].copy()

        inner_cv = KFold(
            n_splits=INNER_SPLITS,
            shuffle=True,
            random_state=1000 + outer_fold,
        )

        penalty_scores = []

        # INNER LOOP: select penalty using outer training data only.
        for penalty in PENALTIES:

            fold_scores = []
            fold_features = []

            for inner_fold, (inner_train_idx, inner_val_idx) in enumerate(
                inner_cv.split(X_outer_train),
                start=1,
            ):

                X_inner_train = X_outer_train.iloc[inner_train_idx].copy()
                X_inner_val = X_outer_train.iloc[inner_val_idx].copy()

                y_inner_train = y_outer_train.iloc[inner_train_idx].copy()
                y_inner_val = y_outer_train.iloc[inner_val_idx].copy()

                score, feature_count = fit_and_score(
                    X_inner_train,
                    y_inner_train,
                    X_inner_val,
                    y_inner_val,
                    penalty,
                )

                fold_scores.append(score)
                fold_features.append(feature_count)

                inner_results.append({
                    "outer_fold": outer_fold,
                    "penalty": penalty,
                    "inner_fold": inner_fold,
                    "c_index": score,
                    "feature_count": feature_count,
                })

            mean_score = float(np.mean(fold_scores))
            std_score = float(np.std(fold_scores, ddof=1))

            penalty_scores.append({
                "penalty": penalty,
                "mean_c_index": mean_score,
                "std_c_index": std_score,
            })

            print(
                f"Penalty {penalty}: "
                f"inner mean C-index={mean_score:.4f}, "
                f"std={std_score:.4f}"
            )

        # Select highest inner mean C-index.
        # If tied, prefer stronger regularisation.
        best = max(
            penalty_scores,
            key=lambda item: (
                item["mean_c_index"],
                item["penalty"],
            ),
        )

        selected_penalty = best["penalty"]

        print(
            f"\nSelected penalty for outer fold {outer_fold}: "
            f"{selected_penalty}"
        )

        # Refit using the complete outer training partition.
        # Evaluate exactly once on the outer validation partition.
        outer_score, feature_count = fit_and_score(
            X_outer_train,
            y_outer_train,
            X_outer_val,
            y_outer_val,
            selected_penalty,
        )

        outer_results.append({
            "outer_fold": outer_fold,
            "selected_penalty": selected_penalty,
            "inner_mean_c_index": best["mean_c_index"],
            "outer_c_index": outer_score,
            "feature_count": feature_count,
            "outer_train_engines": len(X_outer_train),
            "outer_validation_engines": len(X_outer_val),
        })

        print(
            f"Outer fold {outer_fold} C-index: "
            f"{outer_score:.4f}"
        )

    outer_df = pd.DataFrame(outer_results)
    inner_df = pd.DataFrame(inner_results)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    outer_df.to_csv(
        OUTPUT_DIR / "cox_nested_cv_outer_results.csv",
        index=False,
    )

    inner_df.to_csv(
        OUTPUT_DIR / "cox_nested_cv_inner_results.csv",
        index=False,
    )

    print("\n========== NESTED CV RESULTS ==========")
    print(outer_df.to_string(index=False))

    print(
        f"\nNested CV mean C-index: "
        f"{outer_df['outer_c_index'].mean():.4f}"
    )

    print(
        f"Nested CV standard deviation: "
        f"{outer_df['outer_c_index'].std(ddof=1):.4f}"
    )

    print("\nSelected penalties by outer fold:")
    print(
        outer_df["selected_penalty"]
        .value_counts()
        .sort_index()
        .to_string()
    )

    print("\nSaved nested CV results in:")
    print(OUTPUT_DIR)

    return outer_df, inner_df


if __name__ == "__main__":
    run_nested_cross_validation()
