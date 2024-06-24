FROM node:alpine

ARG name

WORKDIR /app

COPY lib lib

WORKDIR /app/back/$name

COPY back/$name/package*.json .
RUN npm install

COPY back/$name/docs back/$name/src cert.key cert.pem .

CMD npm run dev
