FROM node:latest
# Gettext for envsubst being called form entrypoint script
RUN apt-get update -y && \
    apt-get install gettext -y

COPY . /usr/src/app/linto-platform-mongodb-migration
COPY ./docker-entrypoint.sh /
COPY ./wait-for-it.sh /

WORKDIR /usr/src/app/linto-platform-mongodb-migration

EXPOSE 80

# Entrypoint handles the passed arguments

ENTRYPOINT ["/docker-entrypoint.sh"]
# CMD ["npm", "run", "start"]