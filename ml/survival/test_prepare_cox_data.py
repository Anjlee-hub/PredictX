
from ml.survival.prepare_cox_data import prepare_cox_data


def test_cox_data_preparation():
    train_df, test_df = prepare_cox_data()

    assert len(train_df) == 80
    assert len(test_df) == 20

    assert "duration" in train_df.columns
    assert "event" in train_df.columns

    assert (train_df["duration"] > 0).all()
    assert (test_df["duration"] > 0).all()

    assert train_df["unit_id"].nunique() == 80
    assert test_df["unit_id"].nunique() == 20

    assert set(train_df["unit_id"]).isdisjoint(
        set(test_df["unit_id"])
    )

    assert not train_df.isnull().any().any()
    assert not test_df.isnull().any().any()
