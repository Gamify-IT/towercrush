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
      <p class="hint">---------------------</p>
      <button class="btn btn-sm btn-info" @click="timeBoost">
        +5 Time Boost
      </button>
      <p class="hint">---------------------</p>
      <button class="btn btn-sm btn-info" @click="disconnectFromLobby">
        Shield Boost
      </button>
      <p class="hint">----------------------</p>
      <button class="btn btn-sm btn-info" @click="handleLoseLife">
        Hint Boost
      </button>
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
          <h4>You have {{ lives }} lives left.</h4>
        </div>
        <div v-else>
          <h4>You have {{ lives }} lives left.</h4>
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
          <div class="tower-container">
            <video
              class="towerVideo"
              id="towerTeamA"
              width="1080"
              height="1372"
              autoplay
              :src="teamAVideoSource"
            >
              Your browser does not support HTML5 video.
            </video>
            <!-- Dust animation for Team A -->
            <div 
              v-if="showDustAnimationA"
              class="dust-animation"
              @animationend="animationEnded('A')"
            ></div>
          </div>
          <div class="time">{{ towerA }} seconds</div>
        </div>
    
        <div class="tower section tower-team-b">
          <h4>Team B</h4>
          <div class="tower-container">
            <video
              class="towerVideo"
              id="towerTeamB"
              width="1080"
              height="1372"
              autoplay
              :src="teamBVideoSource"
            >
              Your browser does not support HTML5 video.
            </video>
            <!-- Dust animation for Team B -->
            <div 
              v-if="showDustAnimationB"
              class="dust-animation"
              @animationend="animationEnded('B')"
            ></div>
          </div>
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
import { ref, computed, watch, defineProps, defineEmits, onBeforeUnmount, onMounted } from "vue";

import {
  AnswerVote,
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
import clickSoundSource from '@/assets/music/click_sound.mp3';
import putVoteSoundSource from '@/assets/music/put_vote_sound.mp3';
import goodResultSoundSource from '@/assets/music/good_result_sound.mp3';
import axios from "axios";
import config from "@/config";

// Import the video files directly
import towercrush4_normal from '../assets/towercrush4_normal.mp4';
import towercrush3_normal from '../assets/towercrush3_normal.mp4';
import towercrush2_normal from '../assets/towercrush2_normal.mp4';
import towercrush1_normal from '../assets/towercrush1_normal.mp4';
import towercrush_normal from '../assets/towercrush_normal.mp4';

// Import the video files directly
import towercrush4_inverted from '../assets/towercrush4_inverted.mp4';
import towercrush3_inverted from '../assets/towercrush3_inverted.mp4';
import towercrush2_inverted from '../assets/towercrush2_inverted.mp4';
import towercrush1_inverted from '../assets/towercrush1_inverted.mp4';
import towercrush_inverted from '../assets/towercrush_inverted.mp4';
import { getAndChangeVolumeLevel } from "@/ts/volumeLevel";


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
let lives = ref<number>(4); // Max num of lives
const previousLives = ref<number>(lives.value); // Track previous lives to detect change
const showDustAnimationA = ref<boolean>(false);
const showDustAnimationB = ref<boolean>(false);
let volumeLevel : number | null = 0;

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

// Methods to handle game logic

function calculateTowerSize(team: string): number {
  // Calculate tower size based on initial size and remaining lives
  const initialTowerSize = 100; // Example initial tower size
  return initialTowerSize;
}

// Example function to handle game end
function endGame() {
  console.log("Game over!");
}

const teamAVideoSource = computed(() => {
  switch (lives.value) {
    case 4:
      return towercrush4_normal;
    case 3:
      return towercrush3_normal;
    case 2:
      return towercrush2_normal;
    case 1:
      return towercrush1_normal;
    default:
      return towercrush_normal;
  }
});

const teamBVideoSource = computed(() => {
  switch (lives.value) {
    case 4:
      return towercrush4_inverted;
    case 3:
      return towercrush3_inverted;
    case 2:
      return towercrush2_inverted;
    case 1:
      return towercrush1_inverted;
    default:
      return towercrush_inverted;
  }
});

// Watch for changes in lives to trigger animations
watch(lives, (newVal: number, oldVal: number) => {
  if (newVal < oldVal) {
    if (props.team === 'teamA') {
      console.log("showduestAnimationA=true");
      showDustAnimationA.value = true;
    } else if (props.team === 'teamB') {
      console.log("showduestAnimationB=true");
      showDustAnimationB.value = true;
    }
  }
});

// Function to handle the end of the animation
function animationEnded(team: string) {
  if (team === 'A') {
    console.log("animationEnd A.value = false");
    showDustAnimationA.value = false;
  } else if (team === 'B') {
    console.log("animationEnd B.value = false");
    showDustAnimationB.value = false;
  }
}


/**
 * Everytime this component mounts this method adds the local handler function
 */
onMounted(async () => {
  try {
    volumeLevel = await getAndChangeVolumeLevel();

  } catch (error) {
    console.error("Error loading configuration or playing audio: ", error);
  }
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
  playSound(clickSoundSource);
  websockets.disconnectFromLobby(handleMessageReceipt);
  emit("setStateToStart");
}

function timeBoost() {
  //websockets.nextQuestion(props.lobby, props.team);
}

function initGame() {
  let locationArray = window.location.toString().split("/");
  configurationId.value = locationArray[locationArray.length - 1];
  websockets.initGame(props.lobby, configurationId.value);
}

function putVote(answer: string) {
  playSound(putVoteSoundSource);
  websockets.putVote(
    props.lobby,
    props.team,
    currentQuestion.value?.id as string,
    answer
  );
}
function nextQuestion() {
  playSound(clickSoundSource);
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
  lives.value = game.lives;
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
    playSound(goodResultSoundSource);
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
function likeGame() {
  console.log("Liked the Question!");
}

function dislikeGame() {
  console.log("Disliked the Question!");
}

function reportIssue() {
  console.log("Reported an issue with the game!");
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

function playSound(pathToAudioFile: string){
  const sound = new Audio(pathToAudioFile);
  
  sound.volume = volumeLevel !== null ? volumeLevel : 1;
  sound.play();
}
</script>

<style scoped>
.boost-button {
  background-image: url("@/assets/time_boost.png");
  background-size: cover;
  color: white;
}
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
.feedback-section {
  margin-top: 1em;
  display: flex;
  justify-content: center;
  gap: 1em;
}

.feedback-section button {
  padding: 0.5em 1em;
}

.tower-container {
  position: relative; /* Ensure the container is positioned relative for absolute positioning inside */
  display: inline-block;
  width: 100%;
  height: auto;
}

.dust-animation {
  position: absolute;
  top: 0%; /* Center vertically */
  left: 0%; /* Center horizontally */
  width: 70%; /* Reduce size to be smaller, adjust as necessary */
  height: 70%; /* Reduce size to be smaller, adjust as necessary */
  transform: translate(-50%, -50%) scale(1); /* Translate to center */
  background: url('../assets/dust_sprite.png'); /* Use an appropriate sprite or image */
  background-size: contain;
  animation: dustExplosion 1s ease-out;
  pointer-events: none; /* Ensures that the animation doesn't block any interactions */
}

@keyframes dustExplosion {
  0% {
    opacity: 1;
    transform: scale(0.5);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
  100% {
    opacity: 0;
    transform: scale(2);
  }
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
