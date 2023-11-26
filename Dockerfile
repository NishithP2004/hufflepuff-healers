FROM node:latest
WORKDIR /app
COPY package*.json . 
RUN npm i
COPY . .
EXPOSE 3010
CMD ["node", "index.js"]