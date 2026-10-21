FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN mkdir -p uploads

EXPOSE 10000

 HEAD
CMD ["node", "/src/server.js"]

CMD ["node", "src/server.js"]
 1e8436dadb22577228e76167a5c96f0120282365
