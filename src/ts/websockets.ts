import { ref } from "vue";
import Stomp from "stompjs";
import SockJS from "sockjs-client";

const stompClientGame = ref();
const playerUUID = ref("");
export const message = ref("");

export function connect(lobby: string, player: string) {
  console.log("connect to lobby");
  return new Promise((resolve, reject) => {
    stompClientGame.value = Stomp.over(
      new SockJS("/minigames/towercrush/api/v1/connect")
    );
    playerUUID.value = generateUUID();
    console.log("players uuid was: ", playerUUID.value);
    stompClientGame.value.connect(
      { player: player, lobby: lobby, userUUID: playerUUID.value },
      () => resolve(stompClientGame.value)
    );
  });
}

export function subscribePersonalQueue() {
  stompClientGame.value.subscribe(
    "/user/queue/private/messages",
    function (messageOutput: any) {
      message.value = messageOutput.body;
    }
  );
}

export function subscribeLobbyTopic(lobby: string) {
  stompClientGame.value.subscribe(
    "/topic/lobby/" + lobby,
    function (messageOutput: any) {
      message.value = messageOutput.body;
    }
  );
}

export function joinTeam(team: string, lobby: string, player: string) {
  console.log("join team: ", team);
  stompClientGame.value.send(
    `/ws/lobby/${lobby}/join/team/${team}/player/${player}`
  );
}

export function fetchLobbyData(lobby: string) {
  console.log("fetch lobby data");
  stompClientGame.value.send(`/ws/get/infos/on/join/${lobby}`);
}

export function startLobby(lobby: string) {
  if (stompClientGame.value != null) {
    stompClientGame.value.send("/ws/start/lobby/" + lobby);
  } else {
    alert("Please connect first");
  }
}

export function disconnectFromLobby() {
  if (stompClientGame.value != null) {
    stompClientGame.value.disconnect();
  }
  message.value = "Disconnected";
}

//helpmethode remove it when implement uuid from cookie
function generateUUID() {
  let d = new Date().getTime();
  let d2 =
    (typeof performance !== "undefined" &&
      performance.now &&
      performance.now() * 1000) ||
    0;
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    let r = Math.random() * 16;
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
