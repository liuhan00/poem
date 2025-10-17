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

// 知识图谱相关类型
export interface KnowledgeGraphNode {
  id: string;
  type: 'poem' | 'author' | 'dynasty' | 'theme';
  label: string;
  properties: Record<string, any>;
  size?: number;
  color?: string;
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label: string;
  weight: number;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

export interface IntelligentSearchResult {
  poems: Poem[];
  authors: Author[];
  themes: string[];
  related_concepts: string[];
  search_intent: string;
  confidence_score: number;
}

export interface AIAnalysisResult {
  theme: string;
  mood: string;
  rhetorical_devices: string[];
  cultural_context: string;
  modern_interpretation: string;
  difficulty_level: number;
  recommended_reading: string[];
}