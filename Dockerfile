FROM node

# WORKDIR /root
# WORKDIR /Users/nodes_modules
# COPY index.js /root/
COPY index.js /Users/

EXPOSE 3000

RUN npm install express mysql

# CMD node /root/index.js
CMD node /Users/index.js


#ADD index.js /root/docker 

# -p 8080 : 3000

# command on docker 
# npm install
# docker build -t app .
#docker run -p 3000:3000 app        fonctionne




 
#docker run -e MYSQL_HOST='localhost' -e MYSQL_PORT='8889' -e MYSQL_DATABASE='zoo' -e MYSQL_USER='root' -e MYSQL_PASSWORD='root' -p 3000:3000 app 