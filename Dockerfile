FROM node
COPY index.js /root/

RUN npm install express mysql

CMD node /root/index.js


#WORKDIR /root
#ADD index.js /root/

# -p 8080 : 3000


# docker build -t app .
# docker run app -d
#