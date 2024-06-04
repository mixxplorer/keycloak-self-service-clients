FROM dr.rechenknecht.net/bauhelfer/container/main/ubuntu-yarn-lighttp:node-18

LABEL org.opencontainers.image.authors="leo@mixxplorer.de"

USER root
COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && chown www-data:www-data /entrypoint.sh

COPY ./dist /var/www/dist
COPY build/replace-app-environment.js /
RUN chown -R www-data:www-data /var/www

USER www-data
