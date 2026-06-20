export interface User {
    name: string;
    points: number;
    streak: number;
    achievements: number;
  }
  
  export interface LeaderboardUser {
    rank: number;
    name: string;
    username: string;
    points: number;
  }
  
  export interface SDGGoal {
    id: number;
    name: string;
    points: number;
    color: string;
    logo: string;
  }
  
  export interface ActionHistoryItem {
  _id: string;
  description: string;
  sdgs: number[];
  points: number;
  completedAt: string;
  category?: string;
}

export interface ChartData {
    labels: string[];
    co2: number[];
    water: number[];
    community: number[];
  }
  