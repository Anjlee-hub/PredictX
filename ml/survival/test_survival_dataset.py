
from ml.survival.load_cmapss import load_fd001
from ml.survival.build_survival_dataset import build_landmark_dataset


def test_landmark_dataset():
    train_df, _, _ = load_fd001()

    survival_df = build_landmark_dataset(train_df)

    assert len(survival_df) == 100
    assert survival_df["unit_id"].nunique() == 100

    assert (survival_df["landmark_cycle"] == 30).all()
    assert (survival_df["duration"] > 0).all()
    assert (survival_df["event"] == 1).all()

    assert not survival_df.isnull().any().any()

    assert "sensor_1_mean" in survival_df.columns
    assert "sensor_21_std" in survival_df.columns

    assert survival_df.shape[1] == 46
