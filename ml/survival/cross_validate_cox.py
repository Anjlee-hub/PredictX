
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

N_SPLITS = 5
PENALIZER = 0.1


def run_cross_validation():
    data = pd.read_csv(INPUT_PATH)

    features = data.drop(columns=TARGET_COLUMNS)
    targets = data[["duration", "event"]]

    kfold = KFold(
        n_splits=N_SPLITS,
        shuffle=True,
        random_state=42,
    )

    results = []

    for fold, (train_idx, val_idx) in enumerate(
        kfold.split(features),
        start=1,
    ):
        X_train = features.iloc[train_idx].copy()
        X_val = features.iloc[val_idx].copy()

        y_train = targets.iloc[train_idx].copy()
        y_val = targets.iloc[val_idx].copy()

        # Feature selection must happen within each fold.
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

        train_model = pd.concat(
            [
                y_train.reset_index(drop=True),
                X_train_scaled.reset_index(drop=True),
            ],
            axis=1,
        )

        val_model = pd.concat(
            [
                y_val.reset_index(drop=True),
                X_val_scaled.reset_index(drop=True),
            ],
            axis=1,
        )

        model = CoxPHFitter(
            penalizer=PENALIZER,
            l1_ratio=0.0,
        )

        model.fit(
            train_model,
            duration_col="duration",
            event_col="event",
        )

        risk = model.predict_partial_hazard(
            val_model[selected]
        ).to_numpy().ravel()

        c_index = concordance_index(
            val_model["duration"],
            -risk,
            val_model["event"],
        )

        results.append({
            "fold": fold,
            "train_engines": len(train_model),
            "validation_engines": len(val_model),
            "feature_count": len(selected),
            "c_index": float(c_index),
        })

        print(
            f"Fold {fold}: "
            f"C-index={c_index:.4f}, "
            f"features={len(selected)}"
        )

    results_df = pd.DataFrame(results)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    results_df.to_csv(
        OUTPUT_DIR / "cox_cross_validation.csv",
        index=False,
    )

    print("\n--- Cross-Validation Summary ---")
    print(results_df.to_string(index=False))

    print(
        f"\nMean C-index: "
        f"{results_df['c_index'].mean():.4f}"
    )

    print(
        f"Standard deviation: "
        f"{results_df['c_index'].std(ddof=1):.4f}"
    )

    print(
        f"Feature count range: "
        f"{results_df['feature_count'].min()}–"
        f"{results_df['feature_count'].max()}"
    )

    return results_df


if __name__ == "__main__":
    run_cross_validation()
