export class Question {
  id: string;
  text: string;
  rightAnswer: string;
  wrongAnswers: string[];

  public constructor(
    id: string,
    text: string,
    rightAnswer: string,
    wrongAnswers: string[]
  ) {
    this.id = id;
    this.text = text;
    this.rightAnswer = rightAnswer;
    this.wrongAnswers = wrongAnswers;
  }
}

export interface IConfig {
  questions: Question[];
}

export class Config implements IConfig {
  questions: Question[];

  public constructor(questions: Question[]) {
    this.questions = questions;
  }
}

export class RoundResultDTO {
  questionUUId: string;
  question: Question;
  answer: string;

  public constructor(questionUUId: string, question: Question, answer: string) {
    this.questionUUId = questionUUId;
    this.question = question;
    this.answer = answer;
  }
}

export class GameResultDTO {
  configurationAsUUID: string;
  correctAnsweredQuestions: Array<RoundResultDTO>;
  wrongAnsweredQuestions: Array<RoundResultDTO>;
  score: number;
  questionCount: number;

  public constructor(
    configurationAsUUID: string,
    correctAnsweredQuestions: Array<RoundResultDTO>,
    wrongAnsweredQuestions: Array<RoundResultDTO>,
    score: number,
    questionCount: number
  ) {
    this.configurationAsUUID = configurationAsUUID;
    this.correctAnsweredQuestions = correctAnsweredQuestions;
    this.wrongAnsweredQuestions = wrongAnsweredQuestions;
    this.score = score;
    this.questionCount = questionCount;
  }
}

export class JoinTeamMessage {
  team: string;
  player: string;

  public constructor(team: string, player: string) {
    this.team = team;
    this.player = player;
  }
}

export class JoinLobbyMessage {
  playerList: Array<string>;

  public constructor(playerList: Array<string>) {
    this.playerList = playerList;
  }
}

export class DeveloperMessage {
  lobbyList: Lobby[];

  public constructor(lobbyList: Lobby[]) {
    this.lobbyList = lobbyList;
  }
}

export class Lobby {
  teamA: [];
  teamB: [];
  players: Player[];
  createdAt: string;
  lobbyName: string;

  public constructor(
    teamA: [],
    teamB: [],
    players: Player[],
    createdAt: string,
    lobbyName: string
  ) {
    this.teamA = teamA;
    this.teamB = teamB;
    this.players = players;
    this.createdAt = createdAt;
    this.lobbyName = lobbyName;
  }
}

export class Player {
  playerName: string;
  key: string;

  public constructor(playerName: string, key: string) {
    this.playerName = playerName;
    this.key = key;
  }
}

export class MessageWrapper {
  purpose: Purpose;
  data: string;

  public constructor(purpose: Purpose, data: string) {
    this.purpose = purpose;
    this.data = data;
  }
}

export enum Purpose {
  CHAT_MESSAGE = "CHAT_MESSAGE",
  JOIN_TEAM_MESSAGE = "JOIN_TEAM_MESSAGE",
  JOIN_LOBBY_MESSAGE = "JOIN_LOBBY_MESSAGE",
  DEVELOPER_MESSAGE = "DEVELOPER_MESSAGE",
}

export enum GameState {
  START,
  LOBBY,
  GAME,
  RESULTS,
}
