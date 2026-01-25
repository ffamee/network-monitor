#!bin/bash

# Custom entrypoint script to set up Grafana datasources variables
# By reading Environment variables passed via Docker secrets

if [ -f /run/secrets/influxdb2-username ]; then
    export INFLUX_USERNAME=$(cat /run/secrets/influxdb2-username)
else
    echo "WARNING: InfluxDB username secret not found!"
		exit 1
fi

if [ -f /run/secrets/influxdb2-password ]; then
    export INFLUX_PASSWORD=$(cat /run/secrets/influxdb2-password)
else
    echo "WARNING: InfluxDB password secret not found!"
		exit 1
fi

if [ -f /run/secrets/influxdb2-admin-token ]; then
    export INFLUX_TOKEN=$(cat /run/secrets/influxdb2-admin-token)
else
    echo "WARNING: InfluxDB admin token secret not found!"
		exit 1
fi

if [ -f /run/secrets/postgres-user ]; then
    export POSTGRES_USER=$(cat /run/secrets/postgres-user)
fi

if [ -f /run/secrets/postgres-password ]; then
		export POSTGRES_PASSWORD=$(cat /run/secrets/postgres-password)
fi

if [ -f /run/secrets/postgres-db ]; then
		export POSTGRES_DB=$(cat /run/secrets/postgres-db)
fi

echo "✅ Secrets exported to Environment Variables successfully."

# 3. ส่งไม้ต่อให้ Entrypoint เดิมของ Grafana
# ปกติ Grafana image จะใช้ entrypoint เป็น /run.sh
# การใช้ exec "$@" จะช่วยให้มันรับ command arguments ต่อได้ถูกต้อง
exec /run.sh "$@"
