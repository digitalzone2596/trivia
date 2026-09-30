export interface TriviaOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
  votes: number; // Simulated or real live chat votes
}

export interface TriviaQuestion {
  id: string;
  category: string;
  question: string;
  options: TriviaOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  points: number; // Defaults to 10
}

export interface PlayerScore {
  id: string;
  username: string;
  avatar: string; // Emoji or initial
  avatarUrl?: string; // Profile photo from TikTok
  score: number;
  streak: number;
  lastAnswer?: 'A' | 'B' | 'C' | 'D';
  isCorrect?: boolean;
}

export interface WinnerInfo {
  username: string;
  avatar: string;
  avatarUrl?: string;
  score: number;
}

export interface GlobalRankEntry {
  id: string;
  username: string;
  avatarUrl?: string;
  score: number;
  accuracy: number;
  streak: number;
  date: string;
}

export interface ChatComment {
  id: string;
  username: string;
  avatar: string;
  avatarUrl?: string;
  message: string;
  answer?: 'A' | 'B' | 'C' | 'D';
  timestamp: number;
}

export type GamePhase = 
  | 'IDLE'           // Ready to start
  | 'QUESTION'       // Question displayed, timer running, accepting votes
  | 'REVEAL'         // Correct answer revealed, 3s countdown to auto-advance
  | 'GAME_OVER';     // Winner reached target points
