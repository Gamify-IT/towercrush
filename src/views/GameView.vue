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
import { ref } from "vue";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import {
  JoinLobbyMessage,
  JoinTeamMessage,
  MessageWrapper,
  Purpose,
} from "@/ts/models";

const messages = ref<Array<string>>([]);
let stompClientGame = ref();
let lobby = ref("");
let teamAlpha = ref<Array<string>>([]);
let teamBeta = ref<Array<string>>([]);
let players = ref<Array<string>>([]);
const player = ref("");
const playerUUID = ref("");

function connect() {
  console.log("connect to lobby");
  return new Promise((resolve, reject) => {
    stompClientGame.value = Stomp.over(
      new SockJS("/minigames/towercrush/api/v1/connect")
    );
    playerUUID.value = generateUUID();
    console.log("players uuid was: ", playerUUID.value);
    stompClientGame.value.connect(
      { player: player.value, lobby: lobby.value, userUUID: playerUUID.value },
      () => resolve(stompClientGame.value)
    );
  });
}

function connectToLobby() {
  connect()
    .then(() => {
      stompClientGame.value.subscribe(
        "/user/queue/newMember",
        function (messageOutput: any) {
          handleMessageReceipt(messageOutput.body);
        }
      );
    })
    .then(() => {
      stompClientGame.value.subscribe(
        "/topic/lobby/" + lobby.value,
        function (messageOutput: any) {
          handleMessageReceipt(messageOutput.body);
        }
      );
    });
}

function fetchLobbyData() {
  console.log("fetch lobby data");
  stompClientGame.value.send(`/ws/get/infos/on/join/${lobby.value}`);
}

function joinTeam(team: string) {
  stompClientGame.value.send(
    `/ws/lobby/${lobby.value}/join/team/${team}/player/${player.value}`
  );
}

function startLobby() {
  if (stompClientGame.value != null) {
    stompClientGame.value.send("/ws/start/lobby/" + lobby.value);
  } else {
    alert("Please connect first");
  }
}

function disconnectFromLobby() {
  if (stompClientGame.value != null) {
    stompClientGame.value.disconnect();
  }
  handleMessageReceipt("Disconnected");
}

function handleMessageReceipt(messageBody: string) {
  console.log("handle received message!");
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
    console.error("error: ", error);
  }
}
//helpmethode remove it when implement uuid from cookie
function generateUUID() {
  var d = new Date().getTime();
  var d2 =
    (typeof performance !== "undefined" &&
      performance.now &&
      performance.now() * 1000) ||
    0;
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
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
