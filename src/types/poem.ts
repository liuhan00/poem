// src/types/poem.ts
export interface Poem {
  id: string;
  title: string;
  author: string;
  author_id?: string;
  dynasty: string;
  content: string;
  rhythmic_pattern?: string;
  annotation?: string;
  translation?: string;
  appreciation?: string;
  background?: string;
  tags: string[];
  difficulty_level: number;
  popularity: number;
  created_at?: string;
  updated_at?: string;
}

export interface Author {
  id: string;
  name: string;
  dynasty: string;
  biography?: string;
  literary_style?: string;
  achievements?: string;
  life_period?: string;
  portrait_url?: string;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  learning_level: number;
  preferred_dynasties: string[];
  preferred_themes: string[];
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  poem_id: string;
  poem?: Poem;
  created_at: string;
}

export interface SearchResult {
  success: boolean;
  data: Poem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface AIResponse {
  success: boolean;
  data: {
    response: string;
    session_id: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}