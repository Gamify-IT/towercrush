<template>
  <div>
    <b-table striped hover :items="lobbies"></b-table>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import * as websockets from "@/ts/websockets";
import { DeveloperMessage, MessageWrapper, Purpose } from "@/ts/models";
const lobbies = ref();

websockets.clearHandlerFunctions();
websockets.addHandleFunction(handleMessageReceipt);

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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
