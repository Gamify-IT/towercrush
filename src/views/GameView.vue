<template>
  <div v-if="currentState === GameState.START">
    <StartComponent @setStateToLobby="setStateToLobby"></StartComponent>
    <DeveloperComponent></DeveloperComponent>
  </div>
  <div v-if="currentState === GameState.LOBBY">
    <LobbyComponent
      @setStateToStart="setStateToStart"
      :player="player"
      :lobby="lobby"
    ></LobbyComponent>
  </div>
</template>
<script setup lang="ts">
import { GameState } from "@/ts/models";
import StartComponent from "@/components/StartComponent";
import LobbyComponent from "@/components/LobbyComponent";
import DeveloperComponent from "@/components/DeveloperComponent";
import { ref } from "vue";

const currentState = ref(GameState.START);
const lobby = ref("");
const player = ref("");

/**
 * This method changes the state to Lobby
 * @param lobbyParam
 * @param playerParam
 */
function setStateToLobby(lobbyParam: string, playerParam: string) {
  console.log("change state to lobby!");
  lobby.value = lobbyParam;
  player.value = playerParam;
  changeState(GameState.LOBBY);
}

/**
 * This method changes the state to start
 */
function setStateToStart() {
  console.log("change state to start!");
  lobby.value = "";
  player.value = "";
  changeState(GameState.START);
}

function changeState(state: GameState) {
  currentState.value = state;
}
</script>

<style scoped></style>
