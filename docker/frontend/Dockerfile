FROM node:8.9.4-alpine
LABEL mintainer="Jakub Brzegowski <symfiz@gmail.com>"

RUN apk add --no-cache git 
RUN apk add --no-cache yarn

ENV APP_DIR=/home/alvis-editor

COPY package.json ${APP_DIR}/
COPY yarn.lock ${APP_DIR}/

WORKDIR ${APP_DIR}
RUN yarn install --verbose

COPY docker/frontend/entrypoint.sh /
RUN chmod +x /entrypoint.sh
ENTRYPOINT [ "/bin/sh" ]
CMD [ "/entrypoint.sh" ]