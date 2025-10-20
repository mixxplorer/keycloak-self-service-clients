# Testing setup

This folder contains a testing configuration for a Keycloak compatible with the self service plugin. It is intended for debugging and development.

## Running

```bash
# first, build the plugin itself, then continue here

docker compose up
```

Afterwards, the Keycloak will bind to port 8080 on the local machine. Default credentials are `admin`/`notSecure`.

Now, follow the setup documentation of the [project readme](../Readme.md).

Running the container from within a devcontainer is supported. In this case, the container is still run on the main machine and still binds to the host port.
