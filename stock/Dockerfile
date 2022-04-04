FROM node:16.14.2-alpine

ENV NODE_ENV production

WORKDIR /app
COPY ./package.json /app
COPY ./package-lock.json /app
RUN npm install

COPY . .

RUN npm run build
CMD ["npm", "run", "start:prod"]