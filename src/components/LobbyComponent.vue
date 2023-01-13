<template>
  <div class="content" id="websocket">
    <div class="row">
      <div class="col">
        <button
          class="btn btn-sm btn-success"
          @click="startLobby"
          :disabled="readyPlayers.length < players.length"
        >
          Start Lobby
        </button>
        <button class="btn btn-sm btn-primary" @click="disconnectFromLobby">
          Leave Lobby
        </button>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <button class="btn btn-sm btn-danger" @click="joinTeam('teamA')">
          Join TeamA
        </button>
        <button class="btn btn-sm btn-primary" @click="joinTeam('teamB')">
          Join TeamB
        </button>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <button
          class="btn btn-sm btn-outline-info"
          @click="changeReady()"
          :disabled="!props.team.includes('team')"
        >
          Ready:
        </button>
        {{ readyPlayers }}
      </div>
    </div>
    Messages: {{ messages }}<br />
    Team A: {{ teamA }}<br />
    Team B: {{ teamB }}<br />
    Members: {{ players }}<br />
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
  websockets.joinTeam(team, props.lobby);
  emit("setTeam", team);
}

function changeReady() {
  if (props.team.includes("team")) {
    websockets.changeReady(props.lobby);
  }
}

/**
 * button function, when player starts game
 */
function startLobby() {
  console.log("start game");
  websockets.startGame(props.lobby);
}

/**
 * button function
 */
function disconnectFromLobby() {
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
  teamA.value = updatedLobby.updatedLobby.teamA.map(
    (player) => player.playerName
  );
  teamB.value = updatedLobby.updatedLobby.teamB.map(
    (player) => player.playerName
  );
  readyPlayers.value = updatedLobby.updatedLobby.readyPlayers.map(
    (player) => player.playerName
  );
  if (updatedLobby.updatedLobby.started) {
    emit("setStateToGame");
  }
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
