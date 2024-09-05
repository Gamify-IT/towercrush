<template>
  <div class="start-component">
    <div class="create-lobby-menu">
      <div class="center">
        <h1 class="heading">Create a new Lobby</h1>
        <div class="create-lobby-form">
          Lobby Name
          <input class="input" v-model="lobby" />
          Player Name
          <input class="input" v-model="player" />
          <br />
          <button class="btn btn-sm btn-info" @click="connectToLobby">
            Create/Join Lobby
          </button>
        </div>
      </div>
    </div>
    <div class="content">
      <h1 class="heading">Available Lobbies</h1>
      <table class="lobby-table">
        <tr>
          <th>Lobby Name</th>
          <th>Players</th>
          <th>Started</th>
          <th>Join</th>
        </tr>
        <tr v-for="lobby in lobbies" :key="lobby.lobbyName">
          <td>{{ lobby.lobbyName }}</td>
          <td>{{ lobby.playerNames?.join(", ") }}</td>
          <td>{{ lobby.started }}</td>
          <td>
            <button
              class="btn btn-sm btn-info"
              @click="clickLobby(lobby.lobbyName)"
            >
              Join
            </button>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineEmits, onBeforeUnmount, onMounted, ref } from "vue";
import * as websockets from "@/ts/websockets";
import { DeveloperMessage, MessageWrapper, Purpose } from "@/ts/models";
import clickSoundSource from '@/assets/music/click_sound.mp3';
import { getAndChangeVolumeLevel } from "@/ts/volumeLevel";

const clickSound = new Audio(clickSoundSource);
const lobbies = ref();
let volumeLevel : number | null = 0;


/**
 * Everytime this components mounts this method adds the local handler function
 */
onMounted(async () => {
  try {
    volumeLevel = await getAndChangeVolumeLevel();
    clickSound.volume = volumeLevel !== null ? volumeLevel : 1;
  } catch (error) {
    console.error("Error loading configuration or playing audio: ", error);
  }
  websockets.addHandleFunction(handleMessageReceipt);
  subscribeToLobbyList();
});

/**
 * Everytime this components unmounts this method removes the local handler function
 */
onBeforeUnmount(() => {
  websockets.removeHandleFunction(handleMessageReceipt);
});

/**
 * This method handles all incoming messages from the backend
 * @param messageBody message from the backend as string
 */
function handleMessageReceipt(messageBody: string) {
  console.log("handle received developer message!", messageBody);
  const locationArray = window.location.toString().split("/");
  const configurationUUID = locationArray[locationArray.length - 1];
  try {
    let messageWrapper = JSON.parse(messageBody) as MessageWrapper;
    let purpose = messageWrapper.purpose;
    if (purpose == Purpose.DEVELOPER_MESSAGE) {
      console.log("case: DEVELOPER_MESSAGE", messageWrapper.data);
      lobbies.value = (
        JSON.parse(messageWrapper.data) as DeveloperMessage
      ).lobbyList.filter((lobby) => {
        if (configurationUUID === lobby.configurationUUID) {
          return lobby;
        }
      });
    } else {
      console.log("no case found: ", messageBody);
    }
  } catch (error) {
    console.error("error: ", error);
  }
}

const lobby = ref("");
const player = ref(""); //temp
const joinedDevs = ref(false);
/**
 * emits, methods from the GameView (parent)
 */
const emit = defineEmits<{
  (e: "setStateToLobby", lobby: string, player: string): void;
}>();

/**
 * Handler for when user clicks on a lobby in the list.
 */
function clickLobby(lobbyName: string) {
  lobby.value = lobbyName;
  connectToLobby();
}

/**
 * This methods connects and subscribes to the fitting paths if a player wants to join a lobby
 */
function connectToLobby() {
  playClickSound();
  websockets.clearDeveloperLobby();
  websockets
    .connect(lobby.value, player.value)
    .then(() => {
      websockets.subscribePersonalQueue();
    })
    .then(() => {
      websockets.subscribeLobbyTopic(lobby.value);
    })
    .then(() => {
      console.log("emit method setStateToLobby");
      emit("setStateToLobby", lobby.value, player.value);
    });
}

/**
 * This method connects and subscribes to the fitting paths if a developer wants to get lobby infos
 */
function subscribeToLobbyList() {
  websockets
    .connectDeveloper()
    .then(() => {
      websockets.subscribeDeveloperTopic();
    })
    .then(() => {
      joinedDevs.value = true;
    });
}

function playClickSound(){
  clickSound.play();
}
</script>

<style scoped>
.heading {
  color: var(--text-main);
  font-size: 2em;
  margin-bottom: 0.5em;
}

.create-lobby-menu {
  display: flex;
}

.center {
  margin: 2em auto;
  padding: 2em;
  background-color: var(--background-sub);
  border-radius: 0.5em;
}

.create-lobby-form {
  display: flex;
  flex-direction: column;
}

.input {
  margin-bottom: 1em;
  border: 1px solid transparent;
  color: var(--text-main);
  background-color: var(--background-main);
}

.input:focus {
  outline: none;
  border: 1px solid var(--text-main);
}

.content {
  padding: 1vw;
}

.lobby-table {
  width: 100%;
  border-collapse: collapse;
}

.lobby-table th {
  background-color: var(--background-sub);
  padding: 0.5em;
}

.lobby-table td {
  border: 1px solid var(--background-sub);
  padding: 0.5em;
}
</style>
