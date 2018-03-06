FROM node:8.9.4-alpine
LABEL mintainer="Jakub Brzegowski <symfiz@gmail.com>"

RUN apk add --no-cache git 
RUN apk add --no-cache yarn

ENV APP_DIR=/home/alvis-editor

COPY package.json ${APP_DIR}/

WORKDIR ${APP_DIR}
RUN yarn install

COPY docker/backend/entrypoint.sh /
RUN chmod +x /entrypoint.sh
ENTRYPOINT [ "/bin/sh" ]
CMD [ "/entrypoint.sh" ]