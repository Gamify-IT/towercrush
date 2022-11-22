<template>
  <div class="content" id="websocket">
    <div class="row">
      <div class="col">
        Lobby Name: <input v-model="lobbyName" /> Player Name:
        <input v-model="playerName" />
        <button class="btn btn-sm btn-info" @click="connectGame">
          Create game
        </button>
        <button class="btn btn-sm btn-success" @click="startTaskGame">
          Start game
        </button>
        <button class="btn btn-sm btn-danger" @click="stopTaskGame">
          Stop game
        </button>
        <button class="btn btn-sm btn-primary" @click="disconnectGame">
          Close game
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
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { JoinTeamMessage, MessageWrapper, Purpose } from "@/ts/models";

const messages = ref<Array<string>>([]);
let stompClientGame = ref();
let lobbyName = ref("");
let teamAlpha = ref<Array<string>>([]);
let teamBeta = ref<Array<string>>([]);
const playerName = ref("");

function handleMessageReceipt(messageBody: string) {
  console.log("idk remove this one:" + messageBody);
  try {
    let messageWrapper = JSON.parse(messageBody) as MessageWrapper;
    let purpose = messageWrapper.purpose;
    let joinTeam;
    switch (purpose) {
      case Purpose.CHAT_MESSAGE:
        messages.value.push(messageBody);
        break;
      case Purpose.JOIN_TEAM_MESSAGE:
        joinTeam = JSON.parse(messageWrapper.data) as JoinTeamMessage;
        if (
          joinTeam.teamName === "Alpha" &&
          !teamAlpha.value.includes(joinTeam.playerName)
        ) {
          teamAlpha.value.push(joinTeam.playerName);
          teamBeta.value.splice(teamBeta.value.indexOf(joinTeam.playerName), 1);
        } else if (
          joinTeam.teamName === "Beta" &&
          !teamBeta.value.includes(joinTeam.playerName)
        ) {
          teamBeta.value.push(joinTeam.playerName);
          teamAlpha.value.splice(
            teamAlpha.value.indexOf(joinTeam.playerName),
            1
          );
        }
        break;
      default:
        console.log(messageBody);
    }
  } catch (error) {
    console.error(error);
  }
}

function connectGame() {
  const socket = new SockJS("/connect");
  stompClientGame.value = Stomp.over(socket);
  stompClientGame.value.connect({}, () => {
    handleMessageReceipt("Connected");
    stompClientGame.value.subscribe(
      "/topic/games/" + lobbyName.value,
      function (messageOutput: any) {
        handleMessageReceipt(messageOutput.body);
      },
      { type: "" }
    );
  });
}

function disconnectGame() {
  if (stompClientGame.value != null) {
    stompClientGame.value.disconnect();
  }
  handleMessageReceipt("Disconnected");
}

function startTaskGame() {
  if (stompClientGame.value != null) {
    stompClientGame.value.send("/ws/start/lobbyName/" + lobbyName.value);
  } else {
    alert("Please connect first");
  }
}

function stopTaskGame() {
  if (stompClientGame.value != null) {
    stompClientGame.value.send("/ws/stop/lobbyName/" + lobbyName.value);
  } else {
    alert("Please connect first");
  }
}

function joinTeam(teamName: string) {
  stompClientGame.value.send(
    "/ws/lobbyName/" +
      lobbyName.value +
      "/team/" +
      teamName +
      "/player/" +
      playerName.value
  );
}
</script>

<style scoped>
div {
  /*border: black solid 1px;*/
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
