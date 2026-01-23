from slugify import slugify


def square(n: int) -> int:
	return n * n


def slugify_name(name: str) -> str:
	return slugify(name)
