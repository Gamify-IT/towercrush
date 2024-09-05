import config from "@/config";
import axios from "axios";
import { ref } from "vue";

const configurationId = ref<string>("");
const locationArray = window.location.toString().split("/");
configurationId.value = locationArray[locationArray.length - 1];
let volumeLevel : number | null = 0;
export async function getAndChangeVolumeLevel (): Promise<number | null> {
    configurationId.value = locationArray[locationArray.length - 1];
 
    const result = await axios.get(
      `${config.apiBaseUrl}/configurations/` + configurationId.value + `/volume`
    );
    volumeLevel = result.data.volumeLevel;
    if (volumeLevel == 2 || volumeLevel == 3) {
        volumeLevel = 1;
    } else if (volumeLevel == 1) {
        volumeLevel = 0.5;
    }
    return volumeLevel;
}
