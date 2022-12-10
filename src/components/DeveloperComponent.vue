<template>
  <div class="content" id="websocket">
    Currently opened lobbies:
    <b-table show-empty striped hover :items="lobbies" dark> </b-table>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as websockets from "@/ts/websockets";
import { DeveloperMessage, MessageWrapper, Purpose } from "@/ts/models";
const lobbies = ref();

/**
 * Everytime this components mounts this method clears the handler functions
 */
onMounted(() => {
  websockets.clearHandlerFunctions();
  websockets.addHandleFunction(handleMessageReceipt);
});

/**
 * This method handles all incoming messages from the backend
 * @param messageBody message from the backend as string
 */
function handleMessageReceipt(messageBody: string) {
  console.log("handle received developer message!", messageBody);
  try {
    let messageWrapper = JSON.parse(messageBody) as MessageWrapper;
    let purpose = messageWrapper.purpose;
    switch (purpose) {
      case Purpose.DEVELOPER_MESSAGE:
        console.log("case: DEVELOPER_MESSAGE", messageWrapper.data);
        lobbies.value = (
          JSON.parse(messageWrapper.data) as DeveloperMessage
        ).lobbyList;
        break;
      default:
        console.log("no case found: ", messageBody);
    }
  } catch (error) {
    //console.error("error: ", error);
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
