import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

from geoalchemy2.admin.dialects.common import _check_spatial_type
from geoalchemy2.types import Geometry, Geography, Raster

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
# target_metadata = None

from sqlmodel import SQLModel

from app import models  # noqa
from app.config import settings  # noqa

target_metadata = SQLModel.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.

def get_url() -> str:
    return str(settings.SQLALCHEMY_DATABASE_URI)

def include_object(object, name, type_, reflected, compare_to): # type: ignore[no-untyped-def]
    # Exclude 'spatial_ref_sys' from migrations
    if type_ == "index":
        if len(object.expressions) == 1:
            try:
                col = object.expressions[0]
                if (
                    _check_spatial_type(col.type, (Geometry, Geography, Raster)) # type: ignore[no-untyped-call]
                    and col.type.spatial_index
                ):
                    return False
            except AttributeError:
                pass
    if type_ == "table" and name == "spatial_ref_sys":
        return False

    return True

def include_name(name, type_, parent_names): # type: ignore[no-untyped-def]
    # Ignore all schemas except the public schema
    # This is because we don't want to create tables from geoalchemy2
    if type_ == "schema":
        # return False
        return name == "public"
    else:
        return True

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    # url = config.get_main_option("sqlalchemy.url")
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        include_object=include_object,
        include_name=include_name,
        include_schemas=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata,
                    include_object=include_object, include_name=include_name, include_schemas=True)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """In this scenario we need to create an Engine
    and associate a connection with the context.

    """

    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = get_url()

    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""

    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
