<template>
  <div class="content" id="websocket">
    <div class="row">
      <div class="col">
        Lobby Name: <input v-model="lobby" /> Player Name:
        <input v-model="player" />
        <br />
        <button class="btn btn-sm btn-info" @click="connectToLobby">
          Create/Join Lobby
        </button>
        <br />
        <button
          class="btn btn-sm btn-warning"
          @click="connectToDeveloperLobby"
          :disabled="joinedDevs"
        >
          Join Dev
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
const joinedDevs = ref(false);
/**
 * emits, methods from the GameView (parent)
 */
const emit = defineEmits<{
  (e: "setStateToLobby", lobby: string, player: string): void;
}>();

/**
 * This methods connects and subscribes to the fitting paths if a player wants to join a lobby
 */
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
      console.log("emit method setStateToLobby");
      emit("setStateToLobby", lobby.value, player.value);
    });
}

/**
 * This method connects and subscribes to the fitting paths if a developer wants to get lobby infos
 */
function connectToDeveloperLobby() {
  websockets
    .connectDeveloper()
    .then(() => {
      websockets.subscribeDeveloperTopic();
    })
    .then(() => {
      joinedDevs.value = true;
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
