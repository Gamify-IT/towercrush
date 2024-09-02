<template>
  <div v-if="currentState === GameState.START" class="flex-grow-1">
    <StartComponent @setStateToLobby="setStateToLobby"></StartComponent>
  </div>
  <div v-if="currentState === GameState.LOBBY" class="flex-grow-1">
    <LobbyComponent
      @setStateToStart="setStateToStart"
      @setStateToGame="setStateToGame"
      @setTeam="setTeam"
      :player="player"
      :lobby="lobby"
      :team="team"
    ></LobbyComponent>
  </div>
  <div
    v-if="currentState === GameState.GAME"
    class="flex-grow-1 d-flex flex-column"
  >
    <GameComponent
      @setStateToStart="setStateToStart"
      :lobby="lobby"
      :team="team"
    ></GameComponent>
  </div>
</template> 
<script setup lang="ts">
import { GameState } from "@/ts/models";
import StartComponent from "@/components/StartComponent";
import LobbyComponent from "@/components/LobbyComponent";
import { ref } from "vue";
import GameComponent from "@/components/GameComponent.vue";

const currentState = ref(GameState.START);
const lobby = ref("");
const player = ref("");
const team = ref("");

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

function setStateToGame() {
  console.log("change state to game!");
  changeState(GameState.GAME);
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

function setTeam(teamParam: string) {
  team.value = teamParam;
}
</script>

<style scoped></style>
