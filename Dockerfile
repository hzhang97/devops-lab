FROM node

# COPY index.js /root/

COPY index.js /Users/
RUN npm install express mysql

# CMD node /root/index.js
CMD node /Users/index.js


#WORKDIR /root
#ADD index.js /root/

# -p 8080 : 3000

# command on docker 
# docker build -t app .


# docker run app -d ne fonctionne pas mais
# docker run app fonctionne
