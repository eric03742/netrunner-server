FROM node:20

COPY docker/entrypoint.sh /

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

VOLUME /app

WORKDIR /app

ENTRYPOINT ["bash", "/entrypoint.sh"]
