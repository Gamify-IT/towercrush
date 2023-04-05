import axios, { AxiosResponse } from "axios";

import config from "@/config";
import { OverworldResultDTO } from "@/ts/models";

export function getQuestions(configId: string): Promise<AxiosResponse> {
  return axios.get(
    `${config.apiBaseUrl}/configurations/` + configId + `/questions`
  );
}

export function postOverworldResultDTO(
  overworldResultDTO: OverworldResultDTO
): Promise<AxiosResponse> {
  return axios.post(`${config.apiBaseUrl}/results`, overworldResultDTO);
}
