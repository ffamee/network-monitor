from app.services.influx import InfluxService


async def get_building_mean_bandwidth(influxdb_client: InfluxService, building_id: int):
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


async def get_probe_mean_bandwidth(influxdb_client: InfluxService, probe_id: int):
	query = f"""
	from(bucket: "home")
		|> range(start: -10h)
		|> filter(fn: (r) => r["_measurement"] == "internet_speed")
		|> filter(fn: (r) => r["_field"] == "download" or r["_field"] == "upload")
		|> filter(fn: (r) => r["probe_id"] == "{probe_id}")
		|> group(columns: ["_field"], mode:"by")
		|> aggregateWindow(every: 4h, fn: mean, createEmpty: false)
		|> last()
	"""
	return await influxdb_client.query_raw(query)


async def get_probe_mean_internal_latency(
	influxdb_client: InfluxService, probe_id: int
):
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


async def get_probe_mean_external_latency(
	influxdb_client: InfluxService, probe_id: int
):
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


async def get_probe_mean_dns_query(influxdb_client: InfluxService, probe_id: int):
	query = f"""
	from(bucket: "home")
		|> range(start: -10m)
		|> filter(fn: (r) => r["_measurement"] == "dns_query")
		|> filter(fn: (r) => r["_field"] == "query_time_ms" or r["_field"] == "result_code")
		|> filter(fn: (r) => r["probe_id"] == "{probe_id}")
		|> group(columns: ["_field"], mode:"by")
		|> last()
	"""
	return await influxdb_client.query_raw(query)


async def get_probe_mean_ping_latency(influxdb_client: InfluxService, probe_id: int):
	query = f"""
	from(bucket: "home")
		|> range(start: -10m)
		|> filter(fn: (r) => r["_measurement"] == "ping")
		|> filter(fn: (r) => r["_field"] == "average_response_ms" or r["_field"] == "result_code")
		|> filter(fn: (r) => r["probe_id"] == "{probe_id}")
		|> group(columns: ["_field"], mode:"by")
		|> last()
	"""
	return await influxdb_client.query_raw(query)
