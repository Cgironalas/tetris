FROM node:10-alpine

WORKDIR /usr/tetris

COPY package*.json ./

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
