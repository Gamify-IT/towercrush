# Towercrush

A simple single-choice question game.

## Development
> Beginning of additions (that work)
### Getting started

Clone the repository
```sh
git clone https://github.com/Gamify-IT/towercrush.git
```

Install the dependencies
```sh
npm install
```

### Compile and Hot-Reload for Development
To run the project locally with your IDE feature and have all necessary dependencies running,
start the dependencies via docker:
```sh
docker compose -f docker-compose-dev.yaml up
```
Then start the frontend with:
```sh
npm run serve
```
You can now access the game at [localhost](http://localhost).

### Build your local changes as a docker container
To build and run your local changes as a docker container use:
```sh
docker compose up --build
```
You can remove the container with:

```sh
docker compose down
```


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


> End of additions
