FROM node:alpine

WORKDIR /app

COPY front front
COPY lib lib

WORKDIR /app/web_server

COPY web_server/package*.json .
RUN npm install

COPY web_server/src web_server/cert.key web_server/cert.pem .

CMD npm run dev
