FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN mkdir -p uploads

EXPOSE 10000

CMD ["npm", "/test/src/server.js"]
