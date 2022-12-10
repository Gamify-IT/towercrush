<template>
  <div class="content" id="websocket">
    <div class="row">
      <div class="col">
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
import { ref, defineProps, defineEmits, onBeforeUnmount, onMounted } from "vue";
import {
  JoinLeaveLobbyMessage,
  JoinTeamMessage,
  MessageWrapper,
  Purpose,
} from "@/ts/models";
import * as websockets from "@/ts/websockets";

const messages = ref<Array<string>>([]);

let teamAlpha = ref<Array<string>>([]); //lobby (game)
let teamBeta = ref<Array<string>>([]); //lobby (game)
let players = ref<Array<string>>([]); //lobby (game)

const props = defineProps<{
  lobby: string;
  player: string;
}>();

/**
 * emits, methods from the GameView (parent)
 */
const emit = defineEmits<{
  (e: "setStateToStart"): void;
}>();

/**
 * Everytime this components mounts this method adds the handler functions/ fetches lobby data
 */
onMounted(() => {
  websockets.addHandleFunction(handleMessageReceipt);
  websockets.fetchLobbyData(props.lobby);
});

/**
 * button function, when player joins team
 * @param team
 */
function joinTeam(team: string) {
  websockets.joinTeam(team, props.lobby, props.player);
}

/**
 * button function, when player starts game
 */
function startLobby() {
  websockets.startLobby(props.lobby);
}

/**
 * button function
 */
function disconnectFromLobby() {
  websockets.disconnectFromLobby(props.lobby, handleMessageReceipt);
  emit("setStateToStart");
}

/**
 * Before someone closes/refreshes the side, that connection closes (not sure if necessary)
 */
onBeforeUnmount(() => {
  websockets.disconnectFromLobby(props.lobby, handleMessageReceipt);
});

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
      case Purpose.JOIN_TEAM_MESSAGE:
        handleJoinTeamMessage(messageWrapper);
        break;
      case Purpose.JOIN_LOBBY_MESSAGE:
        handleJoinLeaveLobbyMessage(messageWrapper);
        break;
      default:
        console.log("no case found: ", messageBody);
    }
  } catch (error) {
    //console.error("error: ", error);
  }
}

function handleChatMessage(messageBody: string) {
  messages.value.push(messageBody);
}

function handleJoinTeamMessage(messageWrapper: MessageWrapper) {
  let joinTeam = JSON.parse(messageWrapper.data) as JoinTeamMessage;
  if (joinTeam.team === "Alpha" && !teamAlpha.value.includes(joinTeam.player)) {
    teamAlpha.value.push(joinTeam.player);
    teamBeta.value.splice(teamBeta.value.indexOf(joinTeam.player), 1);
  } else if (
    joinTeam.team === "Beta" &&
    !teamBeta.value.includes(joinTeam.player)
  ) {
    teamBeta.value.push(joinTeam.player);
    teamAlpha.value.splice(teamAlpha.value.indexOf(joinTeam.player), 1);
  }
}

function handleJoinLeaveLobbyMessage(messageWrapper: MessageWrapper) {
  let joinLobby = JSON.parse(messageWrapper.data) as JoinLeaveLobbyMessage;
  players.value = joinLobby.playerList;
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
