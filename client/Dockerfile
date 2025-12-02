# STAGE 1: Build di React
FROM node:18-alpine as build

WORKDIR /app

# Copia i file di dipendenze
COPY package*.json ./
RUN npm ci

# Copia il codice sorgente
COPY . .

# Imposta la variabile per la produzione (URL Relativo per il Proxy)
ENV VITE_API_URL=/api

# Compila il progetto nella cartella /app/dist
RUN npm run build

# STAGE 2: Web Server Nginx (Produzione)
FROM nginx:alpine

# Copia i file compilati dallo Stage 1 alla cartella di Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia la nostra configurazione custom di Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]