<template>
  <div class="content" id="websocket">
    <div class="row">
      <div class="col">
        Lobby Name: <input v-model="lobby" /> Player Name:
        <input v-model="player" />
        <button class="btn btn-sm btn-info" @click="connectToLobby">
          Create/Join Lobby
        </button>
        <button class="btn btn-sm btn-info" @click="connectToDeveloperLobby">
          Create/Join Lobby
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, defineEmits } from "vue";
import * as websockets from "@/ts/websockets";

const lobby = ref("");
const player = ref(""); //temp

const emit = defineEmits<{
  (e: "startGame", lobby: string, player: string): void;
}>();

function connectToLobby() {
  websockets.clearDeveloperLobby();
  websockets
    .connect(lobby.value, player.value)
    .then(() => {
      websockets.subscribePersonalQueue();
    })
    .then(() => {
      websockets.subscribeLobbyTopic(lobby.value);
    })
    .then(() => {
      emit("startGame", lobby.value, player.value);
    });
}

function connectToDeveloperLobby() {
  websockets.connectDeveloper().then(() => {
    websockets.subscribeDeveloperTopic();
  });
}
</script>

<style scoped>
div {
  /*border: black solid 1px;*/
}

.content {
  background-color: var(--background-main);
  height: 46.5vh;
  max-width: 100vw;
  padding: 1vw;
  color: var(--text-main);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
