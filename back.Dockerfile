FROM node:alpine

ARG name

WORKDIR /app

COPY lib lib

WORKDIR /app/$name

COPY $name/package*.json .
RUN npm install

COPY $name/dist $name/src .

CMD npm run dev
