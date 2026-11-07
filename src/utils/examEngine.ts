import { ExamConfig, ExamResult, Question } from '../types';

/**
 * Fisher-Yates array shuffle (pure)
 */
export function shuffleArray<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Filter and generate an exam question set based on config
 */
export function createExamQuestions(
  allQuestions: Question[],
  config: ExamConfig
): Question[] {
  let filtered = allQuestions;

  // Filter by chapter
  if (config.chapterFilter !== 0) {
    filtered = filtered.filter(q => q.chapter === config.chapterFilter);
  }

  // Filter by topic
  if (config.topicFilter && config.topicFilter !== 'all') {
    filtered = filtered.filter(q => q.topic === config.topicFilter);
  }

  let prepared = [...filtered];

  if (config.shuffleQuestions) {
    prepared = shuffleArray(prepared);
  }

  // Slice to desired count
  if (config.questionCount > 0 && config.questionCount < prepared.length) {
    prepared = prepared.slice(0, config.questionCount);
  }

  // Optionally shuffle options within questions
  if (config.shuffleOptions) {
    prepared = prepared.map(q => {
      const correctOptionText = q.options[q.correctIndex];
      const shuffledOptions = shuffleArray(q.options);
      const newCorrectIndex = shuffledOptions.indexOf(correctOptionText);
      return {
        ...q,
        options: shuffledOptions,
        correctIndex: newCorrectIndex,
      };
    });
  }

  return prepared;
}

/**
 * Calculate exam results accurately
 */
export function calculateExamScore(
  questions: Question[],
  userAnswers: Record<string, number>,
  timeSpentSeconds: number
): ExamResult {
  let correctCount = 0;
  let wrongCount = 0;

  const ch1Questions = questions.filter(q => q.chapter === 1);
  const ch2Questions = questions.filter(q => q.chapter === 2);

  let ch1Correct = 0;
  let ch2Correct = 0;

  for (const q of questions) {
    const ans = userAnswers[q.id];
    if (ans !== undefined && ans === q.correctIndex) {
      correctCount++;
      if (q.chapter === 1) ch1Correct++;
      if (q.chapter === 2) ch2Correct++;
    } else {
      wrongCount++;
    }
  }

  const total = questions.length;
  const rawScore = total > 0 ? (correctCount / total) * 10 : 0;
  const roundedScore = Math.round(rawScore * 100) / 100;

  const chapterBreakdown: ExamResult['chapterBreakdown'] = [];
  if (ch1Questions.length > 0) {
    chapterBreakdown.push({
      chapter: 1,
      correct: ch1Correct,
      total: ch1Questions.length,
    });
  }
  if (ch2Questions.length > 0) {
    chapterBreakdown.push({
      chapter: 2,
      correct: ch2Correct,
      total: ch2Questions.length,
    });
  }

  return {
    id: 'exam_' + Date.now(),
    date: new Date().toISOString(),
    score: roundedScore,
    totalQuestions: total,
    correctCount,
    wrongCount,
    timeSpentSeconds,
    chapterBreakdown,
    userAnswers,
    questions,
  };
}

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
export function formatTimer(totalSeconds: number): string {
  if (totalSeconds < 0) totalSeconds = 0;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

/**
 * Get qualitative evaluation and academic grade based on score (10-point scale)
 */
export function getScoreGrade(score: number): {
  grade: string;
  badgeColor: string;
  feedback: string;
} {
  if (score >= 9.0) {
    return {
      grade: 'Xuất sắc (A+)',
      badgeColor: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      feedback: 'Kiến thức Triết học Mác - Lênin của bạn cực kỳ vững vàng! Bạn đã sẵn sàng đạt điểm A trong kỳ thi chính thức.',
    };
  } else if (score >= 8.0) {
    return {
      grade: 'Giỏi (A/B+)',
      badgeColor: 'text-blue-700 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      feedback: 'Kết quả rất tốt! Hãy rà soát lại các câu sai để tối ưu điểm số tuyệt đối.',
    };
  } else if (score >= 7.0) {
    return {
      grade: 'Khá (B)',
      badgeColor: 'text-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
      feedback: 'Nắm được các kiến thức cốt lõi. Cần luyện thêm phần các cặp phạm trù và quy luật để đạt điểm cao hơn.',
    };
  } else if (score >= 5.0) {
    return {
      grade: 'Trung bình (C)',
      badgeColor: 'text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      feedback: 'Đã đạt điểm qua môn nhưng còn nhiều chỗ nhầm lẫn. Nên sử dụng chế độ Flashcards và Sổ tay câu sai để ôn lại.',
    };
  } else {
    return {
      grade: 'Cần ôn luyện thêm (D/F)',
      badgeColor: 'text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-800',
      feedback: 'Chưa đạt mức an toàn. Hãy mở Sơ đồ lý thuyết và luyện tập theo từng chương trước khi thi thử lại.',
    };
  }
}
