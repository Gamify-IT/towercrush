<template>
  <div class="content" id="websocket">
    <div class="row">
      <div class="col">
        Lobby Name: <input v-model="lobby" /> Player Name:
        <input v-model="player" />
        <button class="btn btn-sm btn-info" @click="connectToLobby">
          Create/Join Lobby
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
      Members: {{ members }}<br />
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
let members = ref<Array<string>>([]);
const player = ref("");

function connectToLobby() {
  const socket = new SockJS("/minigames/towercrush/api/v1/connect");
  stompClientGame.value = Stomp.over(socket);
  stompClientGame.value.connect(
    { player: player.value, lobby: lobby.value },
    (messageOutput: any) => {
      handleMessageReceipt(messageOutput.body);
      stompClientGame.value.subscribe(
        "/topic/lobbies/" + lobby.value,
        function (messageOutput: any) {
          handleMessageReceipt(messageOutput.body);
        }
      );
    }
  );
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
  console.log("HELLOOOOOOOOOOOOOOOOOOOOOOOOOOOO");
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
        console.log(
          "case: JOIN_TEAM_MESSAGE after parsing lol",
          joinTeam,
          joinTeam.team
        );
        if (
          joinTeam.team === "Alpha" &&
          !teamAlpha.value.includes(joinTeam.player)
        ) {
          console.log("add memeber to alphe");
          teamAlpha.value.push(joinTeam.player);
          teamBeta.value.splice(teamBeta.value.indexOf(joinTeam.player), 1);
        } else if (
          joinTeam.team === "Beta" &&
          !teamBeta.value.includes(joinTeam.player)
        ) {
          console.log("add memeber to betah");
          teamBeta.value.push(joinTeam.player);
          teamAlpha.value.splice(teamAlpha.value.indexOf(joinTeam.player), 1);
        }
        break;
      case Purpose.JOIN_LOBBY_MESSAGE:
        console.log("case: JOIN_LOBBY_MESSAGE");
        joinLobby = JSON.parse(messageWrapper.data) as JoinLobbyMessage;
        members.value.push(joinLobby.player);
        break;
      default:
        console.log("no case found: ", messageBody);
    }
  } catch (error) {
    console.error("error: ", error);
  }
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
