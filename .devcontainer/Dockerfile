FROM debian:trixie

ENV LC_ALL=C.UTF-8

RUN apt-get update
RUN apt-get install -y git curl

# Install NodeJS for Quasar components
RUN apt-get install -y nodejs npm
# Update yarn to latest stable version as otherwise there might be lockfile conflicts with CI
RUN npm install -g corepack
RUN yarn set version stable

# Install Java for Keycloak components
RUN apt-get install -y openjdk-21-jdk openjdk-21-jre
