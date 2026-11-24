
from ml.survival.load_cmapss import load_fd001


def test_fd001_loading():
    train, test, test_rul = load_fd001()

    # Expected dataset structure
    assert train.shape[1] == 27  # 26 raw columns + RUL
    assert test.shape[1] == 26
    assert test_rul.shape[1] == 2

    # Expected engine counts
    assert train["unit_id"].nunique() == 100
    assert test["unit_id"].nunique() == 100
    assert len(test_rul) == 100

    # Validate RUL values
    assert (train["RUL"] >= 0).all()
    assert (test_rul["RUL"] >= 0).all()

    # Each training engine must end at RUL = 0
    final_train = train.groupby("unit_id").tail(1)
    assert (final_train["RUL"] == 0).all()

    # No missing values
    assert not train.isnull().any().any()
    assert not test.isnull().any().any()
    assert not test_rul.isnull().any().any()
