FROM node:alpine

WORKDIR /app

COPY front front
COPY lib lib

WORKDIR /app/web_server

COPY web_server/package*.json .
RUN npm install

COPY web_server/src cert.key cert.pem .

CMD npm run dev
