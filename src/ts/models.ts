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

export class UpdateLobbyMessage {
  updatedLobby: Lobby;

  public constructor(updatedLobby: Lobby) {
    this.updatedLobby = updatedLobby;
  }
}

export class DeveloperMessage {
  lobbyList: Lobby[];

  public constructor(lobbyList: Lobby[]) {
    this.lobbyList = lobbyList;
  }
}

export class Lobby {
  teamA: Player[];
  teamB: Player[];
  players: Player[];
  readyPlayers: Player[];
  createdAt: string;
  lobbyName: string;
  started: boolean;

  public constructor(
    teamA: Player[],
    teamB: Player[],
    players: Player[],
    readyPlayers: Player[],
    createdAt: string,
    lobbyName: string,
    started: boolean
  ) {
    this.teamA = teamA;
    this.teamB = teamB;
    this.players = players;
    this.readyPlayers = readyPlayers;
    this.createdAt = createdAt;
    this.lobbyName = lobbyName;
    this.started = started;
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
  UPDATE_LOBBY_MESSAGE = "UPDATE_LOBBY_MESSAGE",
  DEVELOPER_MESSAGE = "DEVELOPER_MESSAGE",
  UPDATE_GAME_MESSAGE = "UPDATE_GAME_MESSAGE",
  UPDATE_ROUND_MESSAGE = "UPDATE_ROUND_MESSAGE",
}

export enum GameState {
  START,
  LOBBY,
  GAME,
  RESULTS,
}

export class UpdateGameMessage {
  game: Game;

  public constructor(game: Game) {
    this.game = game;
  }
}

export class Vote {
  player: Player;
  answer: string;

  public constructor(player: Player, answer: string) {
    this.player = player;
    this.answer = answer;
  }
}

export class Round {
  question: Question;
  teamA: Vote[];
  teamB: Vote[];

  public constructor(question: Question, teamA: Vote[], teamB: Vote[]) {
    this.question = question;
    this.teamA = teamA;
    this.teamB = teamB;
  }
}

export class Game {
  rounds: Round[];
  currentQuestionTeamA: number;
  currentQuestionTeamB: number;
  teamATowerSize: number;
  teamBTowerSize: number;

  public constructor(
    currentQuestionTeamA: number,
    currentQuestionTeamB: number,
    rounds: Round[],
    teamATowerSize: number,
    teamBTowerSize: number
  ) {
    this.currentQuestionTeamA = currentQuestionTeamA;
    this.currentQuestionTeamB = currentQuestionTeamB;
    this.rounds = rounds;
    this.teamATowerSize = teamATowerSize;
    this.teamBTowerSize = teamBTowerSize;
  }
}

export class AnswerVote {
  answer: string;
  vote: Vote;

  public constructor(answer: string, vote: Vote) {
    this.answer = answer;
    this.vote = vote;
  }
}
