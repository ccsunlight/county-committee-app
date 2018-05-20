FROM node:6.10.0
RUN mkdir -p /usr/scr/app
WORKDIR /usr/src/app
ADD package.json /usr/src/app/package.json
RUN npm install
ADD . /usr/src/app
