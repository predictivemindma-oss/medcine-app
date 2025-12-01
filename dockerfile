FROM node:20-alpine
WORKDIR /app

# AJOUTER CES LIGNES - dépendances système pour Sharp
RUN apk add --no-cache vips-dev vips vips-cpp

COPY package*.json ./
COPY package-lock.json ./
RUN npm ci

COPY . .
RUN echo "MONGODB_URI=mongodb://host.docker.internal:27017/medc" > .env
RUN echo "JWT_SECRET=e8eec2371906bc669db4db95da81e1bb3eee561d45465c3f664668d341caf21c9e5d10ffd8e9fa1f4a33c2b2ad2dcfb04d1c6ba7f637ea533b2b9574cce8aa61" >> .env
RUN echo "NODE_ENV=production" >> .env
RUN echo "PORT=3000" >> .env

RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]