# Step 1: Build React/Vite project
FROM node:20 AS build
WORKDIR /app

# ติดตั้ง dependency
COPY package*.json ./
RUN npm install

# copy source code ทั้งหมด
COPY . .
RUN npm run build

# Step 2: ใช้ nginx serve frontend
FROM nginx:alpine

# copy build ที่เสร็จแล้วไป nginx html
COPY --from=build /app/dist /usr/share/nginx/html

# copy nginx.conf ไปแทน default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
