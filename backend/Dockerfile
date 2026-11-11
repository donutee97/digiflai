FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY prisma.config.ts ./
COPY prisma ./prisma/

RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" npx prisma generate

COPY src ./src/

EXPOSE 4000

CMD ["npm", "start"]