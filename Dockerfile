FROM node:8.9.4

MAINTAINER everis
RUN mkdir -p /app/
ADD /components /app/components
ADD /ethereum /app/ethereum
ADD /pages /app/pages
COPY server.js /app/server.js
COPY routes.js /app/routes.js
COPY package.json /app/package.json
WORKDIR /app
RUN npm install
RUN npm run build
CMD ["npm","run", "prod" ]

# docker build -t edumar111/crowdfund:v1.1.1 -f Dockerfile .
# docker push edumar111/crowdfund:v1.1.1

# docker run  -itd  --name crowdfund -p 3000:3000   edumar111/crowdfund:v1.1.1