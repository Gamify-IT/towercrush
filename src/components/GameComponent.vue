<template>
  <div class="content" id="websocket">
    <div class="row">
      <div class="col">
        <button class="btn btn-sm btn-danger" @click="disconnectFromLobby">
          Leave Lobby
        </button>
        <button
          class="btn btn-sm btn-primary"
          :disabled="!allMembersVoted"
          @click="nextQuestion"
        >
          Next Question
        </button>
      </div>
    </div>
    <div v-if="currentQuestion">Question: {{ currentQuestion.text }}</div>
    <div v-for="answer in currentAnswers" v-bind:key="answer">
      <button class="accordion-button" @click="putVote(answer[0])">
        {{ answer[0] }}
      </button>
      <div class="votes">{{ answer[1] }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, defineProps, defineEmits, onBeforeUnmount, onMounted } from "vue";
import {
  Game,
  MessageWrapper,
  Purpose,
  Question,
  UpdateGameMessage,
  Vote,
} from "@/ts/models";
import * as websockets from "@/ts/websockets";

let currentQuestion = ref<Question>();
let currentAnswers = ref<Map<string, string[]>>();
let allMembersVoted = ref<boolean>();

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
 * Everytime this component mounts this method adds the local handler function
 */
onMounted(() => {
  websockets.addHandleFunction(handleMessageReceipt);
});

/**
 * Everytime this component unmounts this method removes the local handler function
 */
onBeforeUnmount(() => {
  websockets.removeHandleFunction(handleMessageReceipt);
});

/**
 * button function
 */
function disconnectFromLobby() {
  websockets.disconnectFromLobby(handleMessageReceipt);
  emit("setStateToStart");
}

function initGame() {
  let locationArray = window.location.toString().split("/");
  const configurationId = locationArray[locationArray.length - 1];
  websockets.initGame(props.lobby, configurationId);
}

function putVote(answer: string) {
  websockets.putVote(
    props.lobby,
    props.team,
    currentQuestion.value!.id!,
    answer
  );
}

function nextQuestion() {
  websockets.nextQuestion(props.lobby, props.team);
  allMembersVoted.value = false;
}

initGame();

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
    console.error("error: ", error);
  }
}

function handleUpdateGameMessage(messageBody: MessageWrapper) {
  let updateGameMessage = JSON.parse(messageBody.data) as UpdateGameMessage;
  let game = updateGameMessage.game;

  if (props.team === "teamA") {
    currentQuestion.value = game.rounds[game.currentQuestionTeamA].question;
    setAnswersTeamA(game);
  } else {
    currentQuestion.value = game.rounds[game.currentQuestionTeamB].question;
    setAnswersTeamB(game);
  }
}

function setAnswersTeamA(game: Game) {
  let tempAnswers: string[];
  let tempVotes: Vote[];
  tempAnswers = game.rounds[game.currentQuestionTeamA].question.wrongAnswers;
  let rightAnswer = game.rounds[game.currentQuestionTeamA].question.rightAnswer;
  tempAnswers.splice(
    Math.floor(Math.random() * (tempAnswers.length + 1)),
    0,
    rightAnswer
  );
  tempVotes = game.rounds[game.currentQuestionTeamA].teamA;

  currentAnswers.value = new Map<string, string[]>();
  for (let answer of tempAnswers) {
    currentAnswers.value.set(answer, []);
  }
  for (let vote of tempVotes) {
    if (currentAnswers.value.get(vote.answer) !== undefined) {
      currentAnswers.value.get(vote.answer)?.push(vote.player.playerName);
    }
  }
  if (tempVotes.length === game.teamA.length) {
    allMembersVoted.value = true;
  }
}

function setAnswersTeamB(game: Game) {
  let tempAnswers: string[];
  let tempVotes: Vote[];
  tempAnswers = game.rounds[game.currentQuestionTeamB].question.wrongAnswers;
  let rightAnswer = game.rounds[game.currentQuestionTeamB].question.rightAnswer;
  tempAnswers.splice(
    Math.floor(Math.random() * (tempAnswers.length + 1)),
    0,
    rightAnswer
  );
  tempVotes = game.rounds[game.currentQuestionTeamB].teamB;

  currentAnswers.value = new Map<string, string[]>();
  for (let answer of tempAnswers) {
    currentAnswers.value.set(answer, []);
  }
  for (let vote of tempVotes) {
    if (currentAnswers.value.get(vote.answer) !== undefined) {
      currentAnswers.value.get(vote.answer)?.push(vote.player.playerName);
    }
  }
  if (tempVotes.length === game.teamB.length) {
    allMembersVoted.value = true;
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

.votes {
  color: #870c0c;
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
