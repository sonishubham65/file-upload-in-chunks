FROM node:6-alpine
EXPOSE 3000
WORKDIR /usr/src/app
COPY package.json .
RUN npm install && npm cache clean
#COPY . .
#CMD ["tini","--","node","app"]
#CMD ["node", "app"]
