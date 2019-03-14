FROM node:10-alpine

WORKDIR /usr/src/tetris

RUN npm install -g serve

COPY ./build ./

EXPOSE 5000

CMD ["serve", "-s"]
