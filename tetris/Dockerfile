FROM node:10-alpine

WORKDIR /usr/src/tetris

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "-l", "3000", "./build"]
