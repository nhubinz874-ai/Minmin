import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateExamScore, formatTimer, getScoreGrade, createExamQuestions } from './examEngine';
import { Question, ExamConfig } from '../types';

const mockQuestions: Question[] = [
  {
    id: 'q_1_1',
    code: 'Câu 1.1',
    chapter: 1,
    chapterTitle: 'Chương 1',
    topic: 'Khái luận chung',
    question: 'Triết học là gì?',
    options: ['Lý luận chung nhất', 'Cảm nhận', 'Kinh nghiệm', 'Nghệ thuật'],
    correctIndex: 0,
    explanation: 'Đáp án A',
  },
  {
    id: 'q_1_2',
    code: 'Câu 1.2',
    chapter: 1,
    chapterTitle: 'Chương 1',
    topic: 'Vấn đề cơ bản của triết học',
    question: 'Hai mặt vấn đề cơ bản là gì?',
    options: ['Khả tri và bất khả tri', 'Bản thể luận và nhận thức luận', 'Duy vật và duy tâm', 'Lý tính và cảm tính'],
    correctIndex: 1,
    explanation: 'Đáp án B',
  },
  {
    id: 'q_2_1',
    code: 'Câu 2.1',
    chapter: 2,
    chapterTitle: 'Chương 2',
    topic: 'Vật chất & Phương thức tồn tại',
    question: 'Thuộc tính cơ bản nhất của vật chất là gì?',
    options: ['Khối lượng', 'Thực tại khách quan', 'Vận động', 'Đứng im'],
    correctIndex: 1,
    explanation: 'Đáp án B',
  },
  {
    id: 'q_2_2',
    code: 'Câu 2.2',
    chapter: 2,
    chapterTitle: 'Chương 2',
    topic: 'Quy luật Lượng - Chất',
    question: 'Khoảng giới hạn lượng đổi mà chất chưa đổi là gì?',
    options: ['Bước nhảy', 'Điểm nút', 'Độ', 'Chất mới'],
    correctIndex: 2,
    explanation: 'Đáp án C',
  },
];

test('calculateExamScore calculates correct score and chapter breakdown', () => {
  const userAnswers = {
    'q_1_1': 0, // correct
    'q_1_2': 2, // wrong (selected 2, correct 1)
    'q_2_1': 1, // correct
    'q_2_2': 2, // correct
  };

  const result = calculateExamScore(mockQuestions, userAnswers, 120);

  assert.equal(result.totalQuestions, 4);
  assert.equal(result.correctCount, 3);
  assert.equal(result.wrongCount, 1);
  assert.equal(result.score, 7.5);
  assert.equal(result.timeSpentSeconds, 120);

  const ch1 = result.chapterBreakdown.find(c => c.chapter === 1);
  const ch2 = result.chapterBreakdown.find(c => c.chapter === 2);
  assert.equal(ch1?.correct, 1);
  assert.equal(ch1?.total, 2);
  assert.equal(ch2?.correct, 2);
  assert.equal(ch2?.total, 2);
});

test('formatTimer formats time in MM:SS', () => {
  assert.equal(formatTimer(0), '00:00');
  assert.equal(formatTimer(65), '01:05');
  assert.equal(formatTimer(1800), '30:00');
  assert.equal(formatTimer(-10), '00:00');
});

test('getScoreGrade gives appropriate academic feedback', () => {
  assert.equal(getScoreGrade(9.5).grade, 'Xuất sắc (A+)');
  assert.equal(getScoreGrade(8.2).grade, 'Giỏi (A/B+)');
  assert.equal(getScoreGrade(7.0).grade, 'Khá (B)');
  assert.equal(getScoreGrade(5.5).grade, 'Trung bình (C)');
  assert.equal(getScoreGrade(4.0).grade, 'Cần ôn luyện thêm (D/F)');
});

test('createExamQuestions filters by chapter and limits count', () => {
  const config: ExamConfig = {
    chapterFilter: 1,
    topicFilter: 'all',
    questionCount: 1,
    timeLimitMinutes: 15,
    shuffleQuestions: false,
    shuffleOptions: false,
    practiceImmediateFeedback: true,
  };

  const questions = createExamQuestions(mockQuestions, config);
  assert.equal(questions.length, 1);
  assert.equal(questions[0].chapter, 1);
});
