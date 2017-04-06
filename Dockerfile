# latest official node image
FROM node:latest

RUN git config --global user.email 'docker-dummy@example.com'
RUN npm install -g nodemon

# use cached layer for node modules
ADD package.json /tmp/package.json
RUN cd /tmp && npm install --unsafe-perm
RUN mkdir -p /usr/src/bot && cp -a /tmp/node_modules /usr/src/bot/

# add project files
ADD src /usr/src/bot/src
ADD package.json /usr/src/bot/package.json
WORKDIR /usr/src/bot

CMD sleep 5 && ./node_modules/sequelize-cli/bin/sequelize db:migrate --url 'postgres://token:va5uOdJBqu2dZ1@postgres:5432/token' --models-path ./src/bot/models --migrations-path ./src/bot/migrations --seeders-path ./src/bot/seeders --env production && nodemon -L src/bot.js config.yml

