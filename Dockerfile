FROM node:20-alpine

WORKDIR /app

COPY backend/package.json ./
COPY backend/package-lock.json ./
COPY backend/tsconfig.json ./

RUN npm ci || npm install

COPY backend/src ./src

RUN npm run build

RUN npm prune --production

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/index.js"]

