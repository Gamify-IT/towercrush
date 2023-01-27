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
  teams: { teamA: Team; teamB: Team };
  players: Player[];
  readyPlayers: Player[];
  createdAt: string;
  lobbyName: string;
  started: boolean;

  public constructor(
    teams: { teamA: Team; teamB: Team },
    players: Player[],
    readyPlayers: Player[],
    createdAt: string,
    lobbyName: string,
    started: boolean
  ) {
    this.teams = teams;
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
  teamVotes: { teamA: TeamVotes; teamB: TeamVotes };
  teamReadyForNextQuestion: { teamA: boolean; teamB: boolean };

  public constructor(
    question: Question,
    teamVotes: { teamA: TeamVotes; teamB: TeamVotes },
    teamReadyForNextQuestion: { teamA: boolean; teamB: boolean }
  ) {
    this.question = question;
    this.teamVotes = teamVotes;
    this.teamReadyForNextQuestion = teamReadyForNextQuestion;
  }
}

export class Game {
  teams: { teamA: Team; teamB: Team };
  rounds: Round[];
  currentQuestion: { teamA: number; teamB: number };
  towerSize: { teamA: number; teamB: number };
  winnerTeam: string;
  initialTowerSize: number;
  answerPoints: { teamA: number; teamB: number };

  public constructor(
    teams: { teamA: Team; teamB: Team },
    currentQuestion: { teamA: number; teamB: number },
    rounds: Round[],
    towerSize: { teamA: number; teamB: number },
    winnerTeam: string,
    initialTowerSize: number,
    answerPoints: { teamA: number; teamB: number }
  ) {
    this.teams = teams;
    this.currentQuestion = currentQuestion;
    this.rounds = rounds;
    this.towerSize = towerSize;
    this.winnerTeam = winnerTeam;
    this.initialTowerSize = initialTowerSize;
    this.answerPoints = answerPoints;
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

export class Team {
  players: Player[];

  public constructor(players: Player[]) {
    this.players = players;
  }
}

export class TeamVotes {
  votes: Vote[];

  public constructor(votes: Vote[]) {
    this.votes = votes;
  }
}
