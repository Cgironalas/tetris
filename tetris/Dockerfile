FROM node:10-alpine

WORKDIR /usr/src/tetris

COPY package*.json ./

RUN npm install

COPY ./public ./public
COPY ./src ./src

EXPOSE 3000

CMD ["npm", "start"]
