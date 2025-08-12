# Telemetry

The telemetry API collects anonymous usage events to help improve the game. To protect player privacy, the server never stores raw IP addresses. Instead, each request's IP is hashed with SHA-256 and only the hash is used when constructing Redis rate‑limit keys. This allows us to limit requests per client while ensuring that identifiable network information is not retained.
