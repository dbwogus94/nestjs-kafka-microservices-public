FROM node:16.14.2-alpine

WORKDIR /app
COPY ./package.json /app
COPY ./package-lock.json /app
RUN npm install
RUN npm i -g @nestjs/cli

COPY . .

RUN npm run build
CMD ["npm", "run", "start:prod"]