# FROM node:18-bullseye

# WORKDIR /app

# COPY gameboy/package.json ./

# RUN yarn install

# EXPOSE 1234

# CMD ["yarn", "start"]

FROM ubuntu:20.04
WORKDIR /app
RUN apt update
RUN \
    apt install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_14.x | bash - && \
    apt install -y nodejs
RUN \
    apt install -y python3.8 && \
    apt install -y python3-pip && \
    update-alternatives --install /usr/bin/python python /usr/bin/python3.8 1 && \
    update-alternatives --install /usr/bin/pip pip /usr/bin/pip3 1
COPY gameboy/package.json ./
RUN npm install --global yarn
RUN yarn install
EXPOSE 1234
CMD ["yarn", "start"]