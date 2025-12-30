- [x] connect to database [Link](#connect-db)
- [x] prepare pre_start.py [Link](#pre_startpy)
- [ ] set up alembic to migrate
- [ ] set up pre_start in docker compose
- [x] set up lint
- [ ] Building model


# CONNECT-DB
  - use `postgresql+asyncpg` for database connection

# PRE_START.PY
  - looping connect to database until connection successfully

# Type check & Linting
  - set configuration in pyproject.toml
  - using `mypy` to type checking by running `uv run mypy app`
  - using `ruff` for lint (check and format)
    - check: `uv run ruff check app`
    - format: `uv run ruff format app`
