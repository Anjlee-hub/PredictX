
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


from pathlib import Path

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


def run_experiment():
    data = pd.read_csv(INPUT_PATH)

    X = data.drop(columns=TARGET_COLUMNS)
    y = data[["duration", "event"]]

    kfold = KFold(
        n_splits=5,
        shuffle=True,
        random_state=42,
    )

    results = []

    for penalty in PENALTIES:
        fold_scores = []

        for fold, (train_idx, val_idx) in enumerate(
            kfold.split(X),
            start=1,
        ):
            X_train = X.iloc[train_idx].copy()
            X_val = X.iloc[val_idx].copy()

            y_train = y.iloc[train_idx].copy()
            y_val = y.iloc[val_idx].copy()

            # Feature selection on the training fold only.
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

            fold_scores.append(float(score))

            results.append({
                "penalty": penalty,
                "fold": fold,
                "c_index": float(score),
                "feature_count": len(selected),
            })

        print(
            f"Penalty {penalty}: "
            f"mean C-index={np.mean(fold_scores):.4f}, "
            f"std={np.std(fold_scores, ddof=1):.4f}"
        )

    results_df = pd.DataFrame(results)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    results_df.to_csv(
        OUTPUT_DIR / "cox_penalty_comparison.csv",
        index=False,
    )

    summary = (
        results_df.groupby("penalty")
        .agg(
            mean_c_index=("c_index", "mean"),
            std_c_index=("c_index", "std"),
            min_c_index=("c_index", "min"),
            max_c_index=("c_index", "max"),
            mean_features=("feature_count", "mean"),
        )
        .reset_index()
    )

    print("\n--- Penalty Comparison ---")
    print(summary.to_string(index=False))


if __name__ == "__main__":
    run_experiment()
