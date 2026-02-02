from app.services.influx import InfluxService


async def get_mean_bandwidth(influxdb_client: InfluxService, building_id: int):
	query = f"""
	from(bucket: "home")
		|> range(start: -10h)
		|> filter(fn: (r) => r["_measurement"] == "internet_speed")
		|> filter(fn: (r) => r["_field"] == "download" or r["_field"] == "upload")
		|> filter(fn: (r) => r["building_id"] == "{building_id}")
		|> group(columns: ["_field"], mode:"by")
		|> aggregateWindow(every: 4h, fn: mean, createEmpty: false)
		|> last()
	"""
	return await influxdb_client.query_raw(query)


async def get_mean_internal_latency(influxdb_client: InfluxService, probe_id: int):
	query = f"""
	from(bucket: "home")
		|> range(start: -6h)
		|> filter(fn: (r) => r["_measurement"] == "exec_speedtest")
		|> filter(fn: (r) => r["_field"] == "ping")
		|> filter(fn: (r) => r["probe_id"] == "{probe_id}")
		|> group(columns: ["_field"], mode:"by")
		|> aggregateWindow(every: 4h, fn: mean, createEmpty: false)
		|> last()
	"""
	return await influxdb_client.query_raw(query)


async def get_mean_external_latency(influxdb_client: InfluxService, probe_id: int):
	query = f"""
	from(bucket: "home")
		|> range(start: -6h)
		|> filter(fn: (r) => r["_measurement"] == "internet_speed")
		|> filter(fn: (r) => r["_field"] == "latency")
		|> filter(fn: (r) => r["probe_id"] == "{probe_id}")
		|> group(columns: ["_field"], mode:"by")
		|> aggregateWindow(every: 4h, fn: mean, createEmpty: false)
		|> last()
	"""
	return await influxdb_client.query_raw(query)
