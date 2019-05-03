FROM node:10-alpine

RUN mkdir /usr/server
WORKDIR /usr/server
COPY package.json package-lock.json ./
RUN npm install 
ENTRYPOINT npm run dev