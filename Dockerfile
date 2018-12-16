FROM node

# COPY index.js /root/
COPY index.js /Users/

EXPOSE 3000

RUN npm install express mysql

# CMD node /root/index.js
CMD node /Users/index.js
