import axios, { AxiosResponse } from "axios";

import config from "@/config";
import { OverworldResultDTO } from "@/ts/models";
import store from "@/store/index";


export function getQuestions(configId: string): Promise<AxiosResponse> {
  return axios.get(
    `${config.apiBaseUrl}/configurations/` + configId + `/questions`
  );
}

export async function postOverworldResultDTO(
  overworldResultDTO: OverworldResultDTO
): Promise<void> {
  const response = await  axios.post(`${config.apiBaseUrl}/results`, overworldResultDTO);
  const returnedResult = fromDTO(response.data);
  store.commit('setRewards', returnedResult.rewards)



}

function fromDTO(dto: any): OverworldResultDTO {
  return new OverworldResultDTO(
    dto.game,
    dto.configurationId,
    100,
    dto.userId,
   dto.rewards);
}