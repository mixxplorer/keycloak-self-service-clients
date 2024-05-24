#!/bin/bash
set -e

node /replace-app-environment.js spa

exec "$@"
