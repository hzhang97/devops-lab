# Answers

Lastname:Zhang
Firstname:Héloïse

## 2.2 - 
command:docker run app

## 2.3
question:there is no port assign to the container
command:docker run -p 3000:3000 app

## 2.5
question:a tag is needed to know where to push the image and to change the name of the image with docker tag app heloisezhang/zoo
command: docker push heloisezhang/zoo

## 2.6
command:docker system prune -a

question:the system will say that th image cannot be found localy then will download the image from the repository before running it
command:docker run -e MYSQL_HOST='localhost' -e MYSQL_PORT='8889' -e MYSQL_DATABASE='zoo' -e MYSQL_USER='root' -e MYSQL_PASSWORD='root' -p 3000:3000 heloisezhang/zoo:app

command:docker run -e MYSQL_HOST='localhost' -e MYSQL_PORT='8889' -e MYSQL_DATABASE='zoo' -e MYSQL_USER='root' -e MYSQL_PASSWORD='root' -p 3000:3000 -d heloisezhang/zoo:app

## 2.7
question:with the command 'docker ps', it shows the running containers, then we have to campare the id of the running container with the container id returned when the container was started in detached mode
question:the name is jolly_chatterjee
command:docker ps

command:docker run --name dockerise_express_code -e MYSQL_HOST='localhost' -e MYSQL_PORT='8889' -e MYSQL_DATABASE='zoo' -e MYSQL_USER='root' -e MYSQL_PASSWORD='root' -p 3000:3000 heloisezhang/zoo:app

## 2.8
question:
output:

## 3.1
command:

## 3.4
command:
command:
