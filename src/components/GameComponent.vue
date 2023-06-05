<template>
  <div class="nav-actions">
    <div class="col">
      <button class="btn btn-sm btn-danger" @click="disconnectFromLobby">
        Leave Lobby
      </button>
    </div>
  </div>
  <div class="content flex-grow-1 d-flex">
    <div class="question-dialog-box section" v-if="teamWon === ''">
      <div class="status">
        Question {{ currentQuestionIndex + 1 }} of {{ rounds }}:
      </div>
      <h4 class="question" v-if="currentQuestion">
        {{ currentQuestion.text }}
      </h4>
      <ol class="answers" type="a">
        <li
          class="answer"
          v-for="answer of sortedAnswers"
          v-bind:key="answer"
          @click="putVote(answer)"
        >
          <div class="answer-text">{{ answer }}</div>
          <div class="votes">
            <b>
              {{ votes.get(answer).length }} votes<span
                v-if="votes.get(answer).length > 0"
                >:
              </span>
            </b>
            <span v-if="votes.get(answer).length > 0">
              {{ votes.get(answer).join(", ") }}
            </span>
          </div>
        </li>
      </ol>
      <p class="hint">Click on an answer to vote for it.</p>
      <button
        v-if="teamWon === ''"
        class="btn btn-sm btn-primary"
        :disabled="!allMembersVoted"
        @click="nextQuestion"
      >
        Submit Answer
      </button>
      <p class="hint">
        When all your team mates have cast their vote, you can submit the answer
        and continue with the next question.
      </p>
    </div>
    <div class="game-status">
      <div class="game-result section" v-if="teamWon !== ''">
        <div v-if="teamWon === 'teamA'">
          <h4>Game Result: Team A won!</h4>
          <p class="hint">
            Both Team A and Team B have showcased exceptional skill and
            sportsmanship, proving that every match is a victory in its own way.
            Here's to the journey, not just the outcome!
          </p>
        </div>
        <div v-if="teamWon === 'teamB'">
          <h4>Game Result: Team B won!</h4>
          <p class="hint">
            Both Team A and Team B have showcased exceptional skill and
            sportsmanship, proving that every match is a victory in its own way.
            Here's to the journey, not just the outcome!
          </p>
        </div>
        <div v-if="teamWon === 'draw'">
          <h4>Game Result: Draw!</h4>
          <p class="hint">
            Both teams answered the same number of questions correctly.
          </p>
        </div>
      </div>
      <div class="my-tower-status section">
        <div v-if="props.team === 'teamA'">
          <h4>You are in Team A</h4>
        </div>
        <div v-else>
          <h4>You are in Team B</h4>
        </div>
      </div>
      <div
        :class="{
          'tower-status': true,
          'user-team-a': props.team === 'teamA',
          'user-team-b': props.team === 'teamB',
        }"
      >
        <div class="tower section tower-team-a">
          <h4>Team A</h4>
          <video class="towerVideo" id="towerTeamA" width="512" height="1024">
            <source src="../assets/towercrush.mp4" type="video/mp4" />
            Your browser does not support HTML5 video.
          </video>
          <div class="time">{{ towerA }} seconds</div>
        </div>
        <div class="tower section tower-team-b">
          <h4>Team B</h4>
          <video class="towerVideo" id="towerTeamB" width="512" height="1024">
            <source src="../assets/towercrush.mp4" type="video/mp4" />
            Your browser does not support HTML5 video.
          </video>
          <div class="time">{{ towerB }} seconds</div>
        </div>
      </div>
    </div>
    <Particles
      id="tsparticles"
      v-if="props.team === teamWon"
      :particlesInit="particlesInit"
      :particlesLoaded="particlesLoaded"
      :options="confettiConfig"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, defineProps, defineEmits, onBeforeUnmount, onMounted } from "vue";
import {
  Game,
  MessageWrapper,
  OverworldResultDTO,
  Purpose,
  Question,
  UpdateGameMessage,
  Vote,
} from "@/ts/models";
import * as websockets from "@/ts/websockets";
import { postOverworldResultDTO } from "@/ts/minigame-rest-client";
import { loadFull } from "tsparticles";

async function particlesInit(engine: any) {
  await loadFull(engine);
}

function particlesLoaded(container: any) {
  console.log("Particles container loaded", container);
}

let currentQuestion = ref<Question>();
let currentQuestionIndex = ref<number>(0);
let rounds = ref<number>(1);
let towerA = ref<number>();
let towerB = ref<number>();
let teamWon = ref<string>("");
let votes = ref<Map<string, string[]>>();
let sortedAnswers = ref<string[]>([]);
let allMembersVoted = ref<boolean>(false);
let towerTeamA: any;
let towerTeamB: any;
let setSpeed = ref<boolean>(false);
let previousJumpA = ref<number>(0);
let previousJumpB = ref<number>(0);
let previousAnswerPointsTeamA = ref<number>(0);
let previousAnswerPointsTeamB = ref<number>(0);
let configurationId = ref<string>("");

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
  configurationId.value = locationArray[locationArray.length - 1];
  websockets.initGame(props.lobby, configurationId.value);
}

function putVote(answer: string) {
  websockets.putVote(
    props.lobby,
    props.team,
    currentQuestion.value?.id as string,
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
  handleGameFinished();
  pauseIfTooLarge(game);
  updatePoints(
    game.initialTowerSize,
    game.answerPoints.teamA,
    game.answerPoints.teamB
  );
  let teamKey = props.team as keyof typeof game.currentQuestion;
  rounds.value = game.rounds.length;
  currentQuestionIndex.value = game.currentQuestion[teamKey];
  currentQuestion.value = game.rounds[game.currentQuestion[teamKey]].question;
  setAnswers(game);
}

function handleGameFinished() {
  if (teamWon.value !== "") {
    console.log("finished");
    stopTowerAnimations();
    saveWinnerTeam();
  }
}

function stopTowerAnimations() {
  towerTeamA.pause();
  towerTeamB.pause();
}

function saveWinnerTeam() {
  if (teamWon.value === props.team) {
    let gameResultDTO = new OverworldResultDTO(
      "TOWERCRUSH",
      configurationId.value,
      100,
      localStorage.getItem("userId") as string
    );
    postOverworldResultDTO(gameResultDTO);
  }
}

/**
 * This method stops the tower animations if the tower is too large
 * @param game current game
 */
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
  // add correct answer to the list of answers
  let rightAnswer =
    game.rounds[game.currentQuestion[teamKey]].question.rightAnswer;
  tempAnswers.push(rightAnswer);
  // Sort answers so they are displayed in a consistent order.
  // Otherwise, the order will change on every update from the backend.
  tempAnswers.sort();
  sortedAnswers.value = tempAnswers;
  // get votes for current question
  tempVotes =
    game.rounds[game.currentQuestion[teamKey]].teamVotes[teamKey].votes;
  // initialize votes map for every answer
  votes.value = new Map<string, string[]>();
  for (let answer of tempAnswers) {
    votes.value.set(answer, []);
  }
  // add every vote to the selected answer in the votes map
  for (let vote of tempVotes) {
    if (votes.value.get(vote.answer) !== undefined) {
      votes.value.get(vote.answer)?.push(vote.player.playerName);
    }
  }
  // lookup if all players in the team have voted
  allMembersVoted.value =
    game.rounds[game.currentQuestion[teamKey]].teamReadyForNextQuestion[
      teamKey
    ];
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

const confettiConfig = {
  fullScreen: {
    zIndex: 1,
  },
  particles: {
    color: {
      value: ["#FFFFFF", "#FFd700", "#FF0000", "#0000FF"],
    },
    move: {
      direction: "bottom",
      enable: true,
      outModes: {
        default: "out",
      },
      size: true,
      speed: {
        min: 1,
        max: 3,
      },
    },
    number: {
      value: 200,
      density: {
        enable: true,
        area: 800,
      },
    },
    opacity: {
      value: 1,
      animation: {
        enable: false,
        startValue: "max",
        destroy: "min",
        speed: 0.3,
        sync: true,
      },
    },
    rotate: {
      value: {
        min: 0,
        max: 360,
      },
      direction: "random",
      move: true,
      animation: {
        enable: true,
        speed: 60,
      },
    },
    tilt: {
      direction: "random",
      enable: true,
      move: true,
      value: {
        min: 0,
        max: 360,
      },
      animation: {
        enable: true,
        speed: 60,
      },
    },
    shape: {
      type: ["circle", "square", "triangle"],
      options: {},
    },
    size: {
      value: {
        min: 6,
        max: 12,
      },
    },
    roll: {
      darken: {
        enable: true,
        value: 30,
      },
      enlighten: {
        enable: true,
        value: 30,
      },
      enable: true,
      speed: {
        min: 15,
        max: 25,
      },
    },
    wobble: {
      distance: 30,
      enable: true,
      move: true,
      speed: {
        min: -15,
        max: 15,
      },
    },
  },
};
</script>

<style scoped>
.nav-actions {
  padding: 0.5em 1em;
}

h4 {
  font-weight: normal;
}

.content {
  background-color: var(--background-sub);
  gap: 1em;
  padding: 1em;
}

.content > *:first-child {
  margin-left: auto;
}

.content *:last-child {
  margin-right: auto;
}

.question-dialog-box {
  margin-bottom: auto;
}

.section {
  background-color: var(--background-main);
  border-radius: 0.5em;
  padding: 1em;
}

.question {
  margin-bottom: 0.5em;
}

.answer {
  margin: 1em 0;
  padding-left: 0.5em;
  cursor: pointer;
}

.answer:hover .answer-text {
  text-decoration: underline;
}

.votes {
  color: var(--text-sub);
  font-size: 0.8em;
}

.hint {
  font-size: 0.8em;
  font-style: italic;
  margin: 0.5em 0;
}

.game-status {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.tower-status {
  display: flex;
  flex-direction: row;
  gap: 1em;
}

.user-team-b {
  flex-direction: row-reverse;
}

.user-team-a .tower-team-a video {
  width: 15em;
  height: 30em;
}

.user-team-b .tower-team-b video {
  width: 15em;
  height: 30em;
}

.user-team-a .tower-team-b video {
  width: 10em;
  height: 30em;
}

.user-team-b .tower-team-a video {
  width: 10em;
  height: 30em;
}

.user-team-a .tower-team-a .time {
  font-size: 2em;
}

.user-team-b .tower-team-b .time {
  font-size: 2em;
}

.user-team-a .tower-team-b .time {
  line-height: 3em;
}

.user-team-b .tower-team-a .time {
  line-height: 3em;
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
