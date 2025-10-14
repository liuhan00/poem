// src/types/poem.ts
export interface Poem {
  id: number;
  title: string;
  author: string;
  dynasty: string;
  content: string;
}

export interface PoemList extends Array<Poem> {}