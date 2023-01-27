<template>
  <div class="content" id="websocket">
    <div class="row">
      <div class="col">
        <button class="btn btn-sm btn-danger" @click="disconnectFromLobby">
          Leave Lobby
        </button>
        <button
          v-if="teamWon === ''"
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
    TeamA:
    <video class="towerVideo" id="towerTeamA" width="128" height="256">
      <source src="../assets/towercrush.mp4" type="video/mp4" />
      Your browser does not support HTML5 video.</video
    >TeamB:
    <video class="towerVideo" id="towerTeamB" width="128" height="256">
      <source src="../assets/towercrush.mp4" type="video/mp4" />
      Your browser does not support HTML5 video.
    </video>
    tower a: {{ towerA }}, {{ towerATowerPosition }} tower B: {{ towerB }},
    {{ towerBTowerPosition }} team won: {{ teamWon }}
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
let towerA = ref<number>();
let towerB = ref<number>();
let towerATowerPosition = ref<number>();
let towerBTowerPosition = ref<number>();
let teamWon = ref<string>("");
let currentAnswers = ref<Map<string, string[]>>();
let allMembersVoted = ref<boolean>(false);
let towerTeamA: any;
let towerTeamB: any;
let setSpeed = ref<boolean>(false);
let previousJumpA = ref<number>(0);
let previousJumpB = ref<number>(0);
let previousAnswerPointsTeamA = ref<number>(0);
let previousAnswerPointsTeamB = ref<number>(0);

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
  towerA.value = game.towerSize.teamA;
  towerB.value = game.towerSize.teamB;
  teamWon.value = game.winnerTeam;

  if (!setSpeed.value) {
    manipulateVideoSpeed(game.initialTowerSize);
    setSpeed.value = true;
  }
  pauseIfFinished();
  pauseIfTooLarge(game);
  updatePoints(
    game.initialTowerSize,
    game.answerPoints.teamA,
    game.answerPoints.teamB
  );
  let teamKey = props.team as keyof typeof game.currentQuestion;
  currentQuestion.value = game.rounds[game.currentQuestion[teamKey]].question;
  setAnswers(game);
}

function pauseIfFinished() {
  if (teamWon.value !== "") {
    towerTeamA.pause();
    towerTeamB.pause();
  }
}

function pauseIfTooLarge(game: Game) {
  if (game.towerSize.teamA > game.initialTowerSize) {
    towerTeamA.pause();
  } else if (teamWon.value === "") {
    towerTeamA.play();
  }
  if (game.towerSize.teamB > game.initialTowerSize) {
    towerTeamB.pause();
  } else if (teamWon.value === "") {
    towerTeamB.play();
  }
}

function setAnswers(game: Game) {
  let tempAnswers: string[];
  let tempVotes: Vote[];
  let teamKey = props.team as keyof typeof game.currentQuestion;
  tempAnswers =
    game.rounds[game.currentQuestion[teamKey]].question.wrongAnswers;
  let rightAnswer =
    game.rounds[game.currentQuestion[teamKey]].question.rightAnswer;
  tempAnswers.splice(
    Math.floor(Math.random() * (tempAnswers.length + 1)),
    0,
    rightAnswer
  );
  tempVotes =
    game.rounds[game.currentQuestion[teamKey]].teamVotes[teamKey].votes;
  currentAnswers.value = new Map<string, string[]>();
  for (let answer of tempAnswers) {
    currentAnswers.value.set(answer, []);
  }
  for (let vote of tempVotes) {
    if (currentAnswers.value.get(vote.answer) !== undefined) {
      currentAnswers.value.get(vote.answer)?.push(vote.player.playerName);
    }
  }
  allMembersVoted.value =
    game.rounds[game.currentQuestion[teamKey]].teamReadyForNextQuestion.teamA;
}

function manipulateVideoSpeed(targetLength: number) {
  if (towerTeamA === undefined) {
    towerTeamA = document.getElementById("towerTeamA");
    towerTeamA.playbackRate = Math.max(
      1 / 16,
      Math.min(towerTeamA.duration / targetLength, 16)
    );
    towerTeamA.play();
  }
  if (towerTeamB === undefined) {
    towerTeamB = document.getElementById("towerTeamB");
    towerTeamB.playbackRate = Math.max(
      1 / 16,
      Math.min(towerTeamB.duration / targetLength, 16)
    );
    towerTeamB.play();
  }
}

function updatePoints(
  initTowerTime: number,
  newTeamAAnswerPoints: number,
  newTeamBAnswerPoints: number
) {
  if (
    previousAnswerPointsTeamA.value === newTeamAAnswerPoints &&
    previousAnswerPointsTeamB.value === newTeamBAnswerPoints
  ) {
    return;
  } else {
    previousAnswerPointsTeamA.value = newTeamAAnswerPoints;
    previousAnswerPointsTeamB.value = newTeamBAnswerPoints;
  }
  if (towerTeamA === undefined) {
    towerTeamA = document.getElementById("towerTeamA");
  }
  if (towerTeamB === undefined) {
    towerTeamB = document.getElementById("towerTeamB");
  }
  let relativePointsA = newTeamAAnswerPoints / initTowerTime;
  let relativePointsB = newTeamBAnswerPoints / initTowerTime;
  let newJumpA = towerTeamA.duration * relativePointsA;
  let newJumpB = towerTeamB.duration * relativePointsB;
  towerTeamA.currentTime =
    towerTeamA.currentTime + previousJumpA.value - newJumpA;
  towerTeamB.currentTime =
    towerTeamB.currentTime + previousJumpB.value - newJumpB;
  previousJumpA.value = newJumpA;
  previousJumpB.value = newJumpB;
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
