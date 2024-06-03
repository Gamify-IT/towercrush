# towercrush

A simple single-choice question game.

## Development

### Getting started

Clone the repository  
```sh
git clone https://github.com/Gamify-IT/towercrush.git
```

Install the dependencies  
```sh
npm install
```

#### Run with Docker-compose

Start all dependencies with our docker-compose files.
Check the [manual for docker-compose](https://github.com/Gamify-IT/docs/blob/main/dev-manuals/languages/docker/docker-compose.md).

To run the main branch with minimal dependencies use the `docker-compose.yaml` file.\
To run the latest changes on any other branch than `main` use the `docker-compose-dev.yaml` file.


### Compile and Hot-Reload for Development

```sh
npm run serve
```

### Test

Run the tests:
```sh
npm run test:unit
```

To also get the test coverage:
```sh
npm run test:unit -- --coverage
```

### Build

Build the Docker-Container
```sh
docker build -t towercrush-dev .
```
And run it at port 8000 with
```sh
docker run -d -p 8000:80 --name towercrush-dev towercrush-dev
```

To monitor, stop and remove the container you can use the following commands:
```sh
docker ps -a -f name=towercrush-dev
```
```sh
docker stop towercrush-dev
```
```sh
docker rm towercrush-dev
```

## User manual

Run the docker container with the following command at port 8000:
```sh
docker run -d -p 8000:80 --name towercrush ghcr.io/gamify-it/towercrush:latest
```
Now you can access it at [http://localhost:8000](http://localhost:8000).  
To access it externally replace localhost with your IP.  

To monitor the container you can use the following command:
```sh
docker ps -a -f name=towercrush
```
To stop the container you can use the following command:
```sh
docker stop towercrush
```
To remove the container you can use the following command:
```sh
docker rm towercrush
```
