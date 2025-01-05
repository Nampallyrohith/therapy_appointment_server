
commands to pull postgres and setup:
Run this commands in terminal
docker volume create therapy-appointment-db
docker run --name therapy -p 5432:5432 -e POSTGRES_PASSWORD=mysecretpassword -v therapy-appointment-db -d postgres