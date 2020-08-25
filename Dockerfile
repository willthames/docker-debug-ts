FROM node:12.18.3 AS installer
WORKDIR /build
COPY yarn.lock package.json ./
RUN yarn install --frozen-lockfile

FROM node:12.18.3 AS builder
WORKDIR /build
COPY --from=installer /build/node_modules ./node_modules
COPY ./ .
RUN yarn build

FROM node:12.18.3
WORKDIR /app
COPY package.json ./
COPY --from=installer /build/node_modules ./node_modules
COPY static ./static
COPY src/views ./src/views
COPY --from=builder /build/dist ./dist
CMD ["yarn", "start"]
