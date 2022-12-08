<template>
  <div class="content" id="websocket">
    <div class="row">
      <div class="col">
        Lobby Name: <input v-model="lobby" /> Player Name:
        <input v-model="player" />
        <button class="btn btn-sm btn-info" @click="connectToLobby">
          Create/Join Lobby
        </button>
        <button class="btn btn-sm btn-info" @click="fetchLobbyData">
          fetch lobby data
        </button>
        <button class="btn btn-sm btn-success" @click="startLobby">
          Start Lobby (wip)
        </button>
        <button class="btn btn-sm btn-primary" @click="disconnectFromLobby">
          Leave Lobby
        </button>
      </div>
      <div class="row">
        <div class="col">
          <button class="btn btn-sm btn-danger" @click="joinTeam('Alpha')">
            Join Alpha
          </button>
          <button class="btn btn-sm btn-primary" @click="joinTeam('Beta')">
            Join Beta
          </button>
        </div>
      </div>
      Messages: {{ messages }}<br />
      Team Alpha: {{ teamAlpha }}<br />
      Team Beta: {{ teamBeta }}<br />
      Members: {{ players }}<br />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import {
  JoinLobbyMessage,
  JoinTeamMessage,
  MessageWrapper,
  Purpose,
} from "@/ts/models";
import * as websockets from "@/ts/websockets";

const messages = ref<Array<string>>([]);

let lobby = ref(""); // start
let teamAlpha = ref<Array<string>>([]); //lobby (game)
let teamBeta = ref<Array<string>>([]); //lobby (game)
let players = ref<Array<string>>([]); //lobby (game)
const player = ref(""); //temp

function connectToLobby() {
  websockets
    .connect(lobby.value, player.value)
    .then(() => {
      subscribePersonalQueue();
    })
    .then(() => {
      subscribeLobbyTopic();
    })
    .then(() => {
      fetchLobbyData();
    });
}

function subscribePersonalQueue() {
  websockets.subscribePersonalQueue();
}

function subscribeLobbyTopic() {
  websockets.subscribeLobbyTopic(lobby.value);
}

function fetchLobbyData() {
  websockets.fetchLobbyData(lobby.value);
}

function joinTeam(team: string) {
  websockets.joinTeam(team, lobby.value, player.value);
}

function startLobby() {
  websockets.startLobby(lobby.value);
}

function disconnectFromLobby() {
  websockets.disconnectFromLobby();
}

watch(websockets.message, handleMessageReceipt);

function handleMessageReceipt(messageBody: string, name: string) {
  console.log("handle received message!", messageBody, name);
  try {
    let messageWrapper = JSON.parse(messageBody) as MessageWrapper;
    let purpose = messageWrapper.purpose;
    let joinTeam;
    let joinLobby;
    switch (purpose) {
      case Purpose.CHAT_MESSAGE:
        console.log("case: CHAT_MESSAGE");
        messages.value.push(messageBody);
        break;
      case Purpose.JOIN_TEAM_MESSAGE:
        console.log("case: JOIN_TEAM_MESSAGE");
        joinTeam = JSON.parse(messageWrapper.data) as JoinTeamMessage;
        if (
          joinTeam.team === "Alpha" &&
          !teamAlpha.value.includes(joinTeam.player)
        ) {
          teamAlpha.value.push(joinTeam.player);
          teamBeta.value.splice(teamBeta.value.indexOf(joinTeam.player), 1);
        } else if (
          joinTeam.team === "Beta" &&
          !teamBeta.value.includes(joinTeam.player)
        ) {
          teamBeta.value.push(joinTeam.player);
          teamAlpha.value.splice(teamAlpha.value.indexOf(joinTeam.player), 1);
        }
        break;
      case Purpose.JOIN_LOBBY_MESSAGE:
        console.log("case: JOIN_LOBBY_MESSAGE");
        joinLobby = JSON.parse(messageWrapper.data) as JoinLobbyMessage;
        players.value = joinLobby.playerList;
        console.log("joined player:", joinLobby, players.value);
        break;
      default:
        console.log("no case found: ", messageBody);
    }
  } catch (error) {
    //console.error("error: ", error);
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
