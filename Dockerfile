FROM node:10
WORKDIR /usr/src/app
COPY package.json .
RUN npm install
COPY . .
RUN forever start app.js