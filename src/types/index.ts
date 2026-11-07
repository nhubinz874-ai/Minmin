export interface Question {
  id: string;
  code: string;
  chapter: 1 | 2;
  chapterTitle: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type ViewMode = 'dashboard' | 'practice' | 'exam' | 'wrong_book' | 'flashcards' | 'bank_search' | 'theory';

export interface ExamConfig {
  chapterFilter: 0 | 1 | 2; // 0: all
  topicFilter: string; // 'all' or specific topic
  questionCount: number; // e.g. 10, 20, 30, 40, 50, or all
  timeLimitMinutes: number | null; // e.g. 30 mins
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  practiceImmediateFeedback: boolean;
}

export interface ExamResult {
  id: string;
  date: string;
  score: number; // on scale 10
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  timeSpentSeconds: number;
  chapterBreakdown: {
    chapter: 1 | 2;
    correct: number;
    total: number;
  }[];
  userAnswers: Record<string, number>;
  questions: Question[];
}

export interface UserStats {
  totalPracticed: number;
  correctAnswersCount: number;
  wrongQuestionIds: string[];
  bookmarkedQuestionIds: string[];
  examHistory: ExamResult[];
  lastStudyDate: string;
  streakDays: number;
  masteredFlashcardIds: string[];
}

export interface Flashcard {
  id: string;
  term: string;
  category: string;
  chapter: 1 | 2;
  definition: string;
  keyTakeaway: string;
  example: string;
}

export interface TheorySection {
  id: string;
  title: string;
  chapter: 1 | 2;
  keyPoints: {
    heading: string;
    content: string;
    highlights?: string[];
  }[];
}
