FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY hungul_lol/app/package*.json ./
RUN npm ci --silent

# Copy app files
COPY hungul_lol/app/ .

EXPOSE 3000

CMD ["npm", "start"]