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

## Audio sources

1.	Background music
https://pixabay.com/de/music/elektronisch-going-on-foot-133469/

2.	Click
https://pixabay.com/de/sound-effects/interface-button-154180/

3.	Good result
https://pixabay.com/de/sound-effects/goodresult-82807/

4.	Put vote sound
https://pixabay.com/de/sound-effects/button-198922/

5.	Rocket whistle
https://zvukogram.com/zvuk/41741/

6.	Explosion sound
https://zvukogram.com/zvuk/41741/
