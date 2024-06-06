<template>
  <div class="content" id="websocket">
    <div class="center">
      <h1>Lobby: {{ lobby }}</h1>

      <div class="teams">
        <table class="lobby-table all-players">
          <tr>
            <th>
              <span class="table-title">Players</span>
            </th>
          </tr>
          <tr v-for="player in players" :key="player">
            <td>
              {{ player }}
              <b class="check" v-if="readyPlayers.includes(player)">&check;</b>
            </td>
          </tr>
        </table>
        <table class="lobby-table wide-table">
          <tr>
            <th>
              <span class="table-title">Team A</span>
              <button
                class="btn btn-sm btn-danger table-button"
                @click="joinTeam('teamA')"
              >
                Join
              </button>
            </th>
          </tr>
          <tr v-for="player in teamA" :key="player">
            <td>
              {{ player }}
              <b class="check" v-if="readyPlayers.includes(player)">&check;</b>
            </td>
          </tr>
          <tr v-for="i in players.length - teamA.length" v-bind:key="i">
            <td>&nbsp;</td>
          </tr>
        </table>
        <table class="lobby-table wide-table">
          <tr>
            <th>
              <span class="table-title">Team B</span>
              <button
                class="btn btn-sm btn-primary table-button"
                @click="joinTeam('teamB')"
              >
                Join
              </button>
            </th>
          </tr>
          <tr v-for="player in teamB" :key="player">
            <td>
              {{ player }}
              <b class="check" v-if="readyPlayers.includes(player)">&check;</b>
            </td>
          </tr>
          <tr v-for="i in players.length - teamB.length" v-bind:key="i">
            <td>&nbsp;</td>
          </tr>
        </table>
      </div>

      <div class="actions">
        <button class="btn btn-sm btn-dark" @click="disconnectFromLobby">
          Leave Lobby
        </button>
        <button
          class="ready-button btn btn-sm btn-outline-info"
          @click="changeReady()"
          :disabled="!props.team.includes('team')"
        >
          Ready
        </button>
        <button
          class="btn btn-sm btn-success"
          @click="startLobby"
          :disabled="readyPlayers.length < players.length"
        >
          Start Lobby
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineEmits, defineProps, onBeforeUnmount, onMounted, ref } from "vue";
import { MessageWrapper, Purpose, UpdateLobbyMessage } from "@/ts/models";
import * as websockets from "@/ts/websockets";

const messages = ref<Array<string>>([]);

let teamA = ref<Array<string>>([]); //lobby (game)
let teamB = ref<Array<string>>([]); //lobby (game)
let players = ref<Array<string>>([]); //lobby (game)
let readyPlayers = ref<Array<string>>([]);

const props = defineProps<{
  lobby: string;
  player: string;
  team: string;
}>();

/**
 * emits, methods from the GameView (parent)
 */
const emit = defineEmits<{
  (e: "setStateToStart"): void;
  (e: "setStateToGame"): void;
  (e: "setTeam", teamName: string): void;
}>();

/**
 * Everytime this components mounts this method adds the local handler function
 */
onMounted(() => {
  websockets.fetchLobbyData(props.lobby);
  websockets.addHandleFunction(handleMessageReceipt);
});

/**
 * Everytime this components unmounts this method removes the local handler function
 */
onBeforeUnmount(() => {
  websockets.removeHandleFunction(handleMessageReceipt);
});

/**
 * button function, when player joins team
 * @param team
 */
function joinTeam(team: string) {
  playClickSound();
  websockets.joinTeam(team, props.lobby);
  emit("setTeam", team);
}

function changeReady() {
  playClickSound();
  if (props.team.includes("team")) {
    websockets.changeReady(props.lobby);
  }
}

/**
 * button function, when player starts game
 */
function startLobby() {
  playClickSound();
  console.log("start game");
  websockets.startGame(props.lobby);
}

/**
 * button function
 */
function disconnectFromLobby() {
  playClickSound();
  websockets.disconnectFromLobby(handleMessageReceipt);
  emit("setStateToStart");
}

/**
 * This method handles all incoming messages from the backend
 * @param messageBody message from the backend as string
 */
function handleMessageReceipt(messageBody: string) {
  console.log("handle received message!", messageBody);
  try {
    let messageWrapper = JSON.parse(messageBody) as MessageWrapper;
    let purpose = messageWrapper.purpose;
    console.log("case: ", purpose);
    switch (purpose) {
      case Purpose.CHAT_MESSAGE:
        handleChatMessage(messageBody);
        break;
      case Purpose.UPDATE_LOBBY_MESSAGE:
        handleUpdateLobbyMessage(messageWrapper);
        break;
      default:
        console.log("no case found: ", messageBody);
    }
  } catch (error) {
    console.error("error: ", error);
  }
}

function handleChatMessage(messageBody: string) {
  messages.value.push(messageBody);
}

function handleUpdateLobbyMessage(messageWrapper: MessageWrapper) {
  let updatedLobby = JSON.parse(messageWrapper.data) as UpdateLobbyMessage;
  players.value = updatedLobby.updatedLobby.players.map(
    (player) => player.playerName
  );
  teamA.value = updatedLobby.updatedLobby.teams.teamA.players.map(
    (player) => player.playerName
  );
  teamB.value = updatedLobby.updatedLobby.teams.teamB.players.map(
    (player) => player.playerName
  );
  readyPlayers.value = updatedLobby.updatedLobby.readyPlayers.map(
    (player) => player.playerName
  );
  if (updatedLobby.updatedLobby.started) {
    emit("setStateToGame");
  }
}

function playClickSound(){
  const clickSound = new Audio("@/assets/music/click_sound.mp3");
  clickSound.play();
}
</script>

<style scoped>
div {
  /*border: black solid 1px;*/
}

.content {
  background-color: var(--background-main);
  height: 93vh;
  max-width: 100vw;
  padding: 1vw;
  color: var(--text-main);

  display: flex;
  flex-direction: column;
}

.center {
  margin: 0 auto;
}

.teams {
  margin: 1em 0;
  display: flex;
}

.all-players {
  margin-right: 0.5em;
}

.lobby-table {
  float: left;
  width: 20em;
  border-collapse: collapse;
}

.wide-table {
  width: 30em;
}

.lobby-table th {
  background-color: var(--background-sub);
  padding: 0.5em;
  display: flex;
  height: 3em;
}

.lobby-table td {
  border: 1px solid var(--background-sub);
  padding: 0.5em;
}

.table-title {
  margin: auto 0;
  flex-grow: 1;
}

.table-button {
  flex-grow: 0;
}

.actions {
  display: flex;
}

.ready-button {
  margin: 0 0.5em 0 auto;
}

.check {
  color: #46e800;
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
