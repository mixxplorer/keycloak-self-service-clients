# Keycloak Self Service Clients (self-service-clients)

Manage personal Keycloak clients to integrate organization authentication into your apps!

## Install the dependencies

```bash
corepack up
# or
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
# Replace the Keycloak URL with the Keycloak you want to use
KEYCLOAK_URL=http://localhost:8080 yarn dev
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
