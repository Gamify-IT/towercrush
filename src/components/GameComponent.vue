<template>
  <div class="content" id="websocket">
    <div class="row">
      <div class="col">
        <button class="btn btn-sm btn-primary" @click="disconnectFromLobby">
          Leave Lobby
        </button>
        <button class="btn btn-sm btn-primary" @click="nextQuestion">
          next Question Test
        </button>
      </div>
    </div>
    {{ currentQuestion }}
  </div>
</template>
<script setup lang="ts">
import { ref, defineProps, defineEmits, onBeforeUnmount, onMounted } from "vue";
import { MessageWrapper, Purpose, UpdateGameMessage } from "@/ts/models";
import * as websockets from "@/ts/websockets";

let currentQuestion = ref<string>();

const props = defineProps<{
  lobby: string;
  team: string;
}>();

/**
 * emits, methods from the GameView (parent)
 */
const emit = defineEmits<{
  (e: "setStateToStart"): void;
}>();

/**
 * Everytime this components mounts this method adds the local handler function
 */
onMounted(() => {
  websockets.addHandleFunction(handleMessageReceipt);
});

/**
 * Everytime this components unmounts this method removes the local handler function
 */
onBeforeUnmount(() => {
  websockets.removeHandleFunction(handleMessageReceipt);
});

/**
 * button function
 */
function disconnectFromLobby() {
  websockets.disconnectFromLobby(props.lobby, handleMessageReceipt);
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
      case Purpose.UPDATE_GAME_MESSAGE:
        handleUpdateGameMessage(messageWrapper);
        break;
      default:
        console.log("no case found: ", messageBody);
    }
  } catch (error) {
    //console.error("error: ", error);
  }
}

function handleUpdateGameMessage(messageBody: MessageWrapper) {
  let updateGameMessage = JSON.parse(messageBody.data) as UpdateGameMessage;
  let game = updateGameMessage.game;
  if (props.team === "teamA") {
    currentQuestion.value =
      game.rounds[game.currentQuestionTeamA].question.text;
  } else {
    currentQuestion.value =
      game.rounds[game.currentQuestionTeamB].question.text;
  }
}

function click() {
  websockets.click(props.lobby);
}

function initGame() {
  let locationArray = window.location.toString().split("/");
  const configurationId = locationArray[locationArray.length - 1];
  websockets.initGame(props.lobby, configurationId);
}

function nextQuestion() {
  websockets.nextQuestion(props.lobby, props.team);
}

initGame();
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
