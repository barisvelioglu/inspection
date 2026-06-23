# ---------- Stage 1: build the React client ----------
FROM node:20-alpine AS client
WORKDIR /client
COPY client/package.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# ---------- Stage 2: server that also serves the built client ----------
FROM node:20-alpine AS server
WORKDIR /app
ENV NODE_ENV=production
COPY server/package.json ./
RUN npm install --omit=dev
COPY server/ ./
# Built SPA is served as static files by Express.
COPY --from=client /client/dist ./public
EXPOSE 8080
CMD ["node", "src/index.js"]
