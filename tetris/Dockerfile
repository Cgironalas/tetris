FROM node:10-alpine

WORKDIR /usr/tetris

COPY package*.json ./
COPY ./src ./src
COPY ./public ./public

RUN npm install && npm run build

RUN npm install -g serve

#COPY ./build ./build

EXPOSE 3000

CMD ["serve", "-s", "-l", "3000", "./build"]
