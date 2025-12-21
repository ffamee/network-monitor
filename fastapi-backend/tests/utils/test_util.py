from app.utils import util


def test_square():
    assert util.square(2) == 4
    assert util.square(-3) == 9
    assert util.square(0) == 0
