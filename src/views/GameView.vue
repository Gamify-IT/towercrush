<template>
  <div v-if="currentState === GameState.START">
    <StartComponent @startGame="startLobby"></StartComponent>
  </div>
  <div v-if="currentState === GameState.LOBBY">
    <LobbyComponent
      @disconnectLobby="disconnectLobby"
      :player="player"
      :lobby="lobby"
    ></LobbyComponent>
  </div>
</template>
<script setup lang="ts">
import { GameState } from "@/ts/models";
import StartComponent from "@/components/StartComponent";
import LobbyComponent from "@/components/LobbyComponent";
import { ref } from "vue";

const currentState = ref(GameState.START);
const lobby = ref("");
const player = ref("");

function startLobby(lobbyParam: string, playerParam: string) {
  console.log("change state to lobby!");
  lobby.value = lobbyParam;
  player.value = playerParam;
  changeState(GameState.LOBBY);
}

function disconnectLobby() {
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
