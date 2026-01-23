from app.utils import util


def test_square():
	assert util.square(2) == 4
	assert util.square(-3) == 9
	assert util.square(0) == 0


def test_slugify_name():
	assert util.slugify_name("Test Name") == "test-name"
	assert util.slugify_name("Another_Test-Name!") == "another-test-name"
	assert util.slugify_name("  Leading and Trailing  ") == "leading-and-trailing"
	assert util.slugify_name("特殊字符") == "te-shu-zi-fu"
	assert util.slugify_name("") == ""
	assert util.slugify_name("123 Numbers 456") == "123-numbers-456"
	assert util.slugify_name("ตึกวิศวกรรม อาคาร 8") == "tuekwiswkrrm-aakhaar-8"
