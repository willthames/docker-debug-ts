FROM node:12.18.3 AS builder
WORKDIR /build
COPY yarn.lock package.json ./
RUN yarn install --frozen-lockfile
COPY ./ .
RUN yarn build

FROM node:12.18.3
WORKDIR /app
COPY --from=builder /build/dist ./dist
COPY package.json ./
COPY --from=builder /build/node_modules ./node_modules
COPY static ./static
COPY src/views ./src/views
CMD ["yarn", "start"]
