- [x] connect to database [Link](#connect-db)
- [x] prepare pre_start.py [Link](#pre_startpy)
- [x] set up alembic to migrate [Link](#alembic-migration)
- [ ] set up pre_start in docker compose
- [x] set up lint [Link](#type-check--linting)
- [ ] Zone model


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

# Alembic migration
  - run versioning: `uv run alembic revision --autogenerate -m "message"`
  - run migrate: `uv run alembic upgrade head`
  - run downgrade: `uv run alembic downgrade <target>`
	- `alembic downgrade -1` - Downgrade one revision
	- `alembic downgrade base` - Downgrade to initial state (remove all Alembic-created tables)
	- `alembic downgrade <revision_id>` - Downgrade to a specific revision
	- `alembic downgrade -<n>` - Downgrade n steps



# FastAPI Tips

## Defining Response Models

**Step 1: Create a Pydantic Model Class**
- Define your data structure with proper type hints and validation

**Step 2: Configure Which Fields to Return**

Use these parameters in your router endpoint to control the response output:

- **`response_model_exclude`** / **`response_model_include`**
  - Selectively exclude or include specific fields in the response
  - For list/tuple/dict responses, use `__all__` to specify included fields (see [Pydantic docs](https://docs.pydantic.dev/2.4/concepts/serialization/#advanced-include-and-exclude))

- **`response_model_exclude_none`**
  - Removes any fields with `None` values from the response

- **`response_model_exclude_unset`**
  - Excludes fields that weren't explicitly set during object creation (useful for partial updates)

- **`response_model_exclude_default`**
  - Removes fields that are using their default values
