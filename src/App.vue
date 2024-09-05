<template>
  <div class="main">
    <nav
      class="navbar navbar-expand-lg navbar-light bg-dark"
      aria-label="Navigation Bar"
    >
      <a id="towercrush-game">Towercrush</a>
      <nav class="ms-auto" aria-label="Navigation Bar">
        <dark-mode id="darkModeButtonApp"></dark-mode>
        <b-button
          class="nav-buttons"
          id="restart-button"
          v-on:click="handleReloadPage"
        >
          Restart
        </b-button>
        <b-button class="nav-buttons" id="close-button" v-on:click="handleCloseGame">
          Close
        </b-button>
      </nav>
    </nav>
    <div class="flex-grow-1 d-flex flex-column">
      <GameView></GameView>
    </div>
  </div>
</template>

<script setup lang="ts">
import DarkMode from "@/components/DarkModeComponent.vue";
import GameView from "@/views/GameView.vue";
import { onMounted, onUnmounted } from "vue";
import backgroundMusicSource from '@/assets/music/background_music.mp3';
import clickSoundSource from '@/assets/music/click_sound.mp3';

const clickSound = new Audio(clickSoundSource);
const backgroundMusic = new Audio(backgroundMusicSource);
import { getAndChangeVolumeLevel } from "./ts/volumeLevel";
let volumeLevel : number | null = 0;

onMounted(async () => {
  try {
    volumeLevel = await getAndChangeVolumeLevel();
    backgroundMusic.volume = volumeLevel !== null ? volumeLevel : 1;
    clickSound.volume = volumeLevel !== null ? volumeLevel : 1;
    backgroundMusic.loop = true;
    await backgroundMusic.play();
  } catch (error) {
    console.error("Error loading configuration or playing audio: ", error);
  }
});

onUnmounted(() => {
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
})

function reloadPage() {
  window.location.reload();
}

function closeGame() {
  window.parent.postMessage("CLOSE ME");
}

function playClickSound(){
  clickSound.play();
}

async function handleCloseGame() {
  await playClickSound();
    setTimeout(() => {
      closeGame();
    }, 500);
}

async function handleReloadPage() {
  await playClickSound();
    setTimeout(() => {
      reloadPage();
    }, 500);
}
</script>

<style scoped>
.main {
  background-color: var(--background-main);
  color: var(--text-main);
  min-height: 100vh;
  width: 100vw;

  display: flex;
  flex-direction: column;
}

.navbar {
  padding-left: 1vw;
  height: 4em;
}

#towercrush-game {
  color: white;
}

.nav-buttons {
  border-color: #212529;
  background-color: #212529;
  margin-right: 1vw;
}

#restart-button:hover {
  border-color: #0c4c87;
  background-color: #0c4c87;
}

#close-button:hover {
  border-color: #870c0c;
  background-color: #870c0c;
}

#darkModeButtonApp {
  float: left;
  margin-right: 1vw;
  margin-top: 2px;
}
</style>

<style>
/* These are global variables for the dark mode, make sure to add local style to the scoped style above */
:root {
  --background-main: #ffffff;
  --background-sub: #dddddd;
  --border-main: #000000;
  --border-sub: #000000;
  --text-main: #222;
  --text-sub: #444;
  --element-size: 4vw;
  --button-main: #2f2f2f;
}

:root.dark-theme {
  --background-main: #1e1e1e;
  --background-sub: #2d2d30;
  --border-main: #1f1f1f;
  --border-sub: #3f3f3f;
  --text-main: #ddd;
  --text-sub: #aaa;
  --button-main: #ffffff;
}
</style>
