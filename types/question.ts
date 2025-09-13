export interface Question {
  id?: string;
  question: string;
  context?: string;
  answer_city: string;
  answer_country: string;
  answer_lat: number;
  answer_lng: number;
  difficulty: number;
  category: string;
  time_period?: string;
  fun_fact?: string;
  created_at?: string;
  image_url?: string | null;
  image_alt: string;
}

export interface QuestionRequest {
  category: string;
  difficulty?: number;
  count: number;
}       

export type QuestionCategory = 
  | 'historical_figures'
  | 'inventions'
  | 'disasters'
  | 'geography'
  | 'landmarks'
  | 'food_culture'
  | 'mixed';

// For the database insert (without id and created_at)
export type QuestionInsert = Omit<Question, 'id' | 'created_at'>;

// For API responses
export interface QuestionResponse {
  questions: Question[];
  total?: number;
}

export interface BatchGenerateRequest {
  categories?: QuestionCategory[];
  batchSize?: number;
}

export interface BatchGenerateResponse {
  success: boolean;
  results: Array<{
    category: string;
    generated: number;
  }>;
  total: number;
}