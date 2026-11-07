import React, { useState, useEffect } from 'react';
import { ExamResult } from '../types';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  BookMarked, 
  RotateCcw, 
  Check, 
  X, 
  Home, 
  Eye, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getScoreGrade, formatTimer } from '../utils/examEngine';

interface ExamResultModalProps {
  result: ExamResult;
  onRetake: () => void;
  onGoHome: () => void;
  onSaveWrongQuestions: (questionIds: string[]) => void;
}

export const ExamResultModal: React.FC<ExamResultModalProps> = ({
  result,
  onRetake,
  onGoHome,
  onSaveWrongQuestions,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'wrong' | 'correct'>('all');
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});
  const [hasSavedWrong, setHasSavedWrong] = useState<boolean>(false);

  const gradeInfo = getScoreGrade(result.score);

  useEffect(() => {
    if (result.score >= 8.0) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    }
  }, [result.score]);

  const wrongQuestions = result.questions.filter((q) => {
    const userAns = result.userAnswers[q.id];
    return userAns === undefined || userAns !== q.correctIndex;
  });

  const handleSaveWrong = () => {
    const ids = wrongQuestions.map(q => q.id);
    onSaveWrongQuestions(ids);
    setHasSavedWrong(true);
  };

  const filteredQuestions = result.questions.filter((q) => {
    const userAns = result.userAnswers[q.id];
    const isCorrect = userAns !== undefined && userAns === q.correctIndex;
    if (filterMode === 'correct') return isCorrect;
    if (filterMode === 'wrong') return !isCorrect;
    return true;
  });

  const toggleExplanation = (qId: string) => {
    setExpandedExplanations(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Score Summary Hero Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm text-center space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Kết quả bài thi trắc nghiệm</span>
        </div>

        <div className="space-y-2">
          <div className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
            {result.score.toFixed(1)} <span className="text-2xl sm:text-3xl font-medium text-slate-400 font-sans">/ 10</span>
          </div>
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${gradeInfo.badgeColor}`}>
              {gradeInfo.grade}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto pt-1 leading-relaxed">
            {gradeInfo.feedback}
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] text-slate-500">Số câu đúng</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {result.correctCount} <span className="text-xs font-normal text-slate-400">/ {result.totalQuestions}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] text-slate-500">Số câu sai</div>
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
              {result.wrongCount} <span className="text-xs font-normal text-slate-400">câu</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] text-slate-500">Thời gian làm</div>
            <div className="text-lg font-bold text-slate-800 dark:text-slate-200 font-mono tabular-nums">
              {formatTimer(result.timeSpentSeconds)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] text-slate-500">Tốc độ trung bình</div>
            <div className="text-lg font-bold text-slate-800 dark:text-slate-200 font-mono tabular-nums">
              {result.totalQuestions > 0 ? Math.round(result.timeSpentSeconds / result.totalQuestions) : 0} <span className="text-xs font-normal text-slate-400">s/câu</span>
            </div>
          </div>
        </div>

        {/* Chapter Breakdown */}
        {result.chapterBreakdown.length > 0 && (
          <div className="pt-3 max-w-2xl mx-auto space-y-2 text-left border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tỷ lệ đúng theo chương
            </div>
            <div className="space-y-2">
              {result.chapterBreakdown.map((b) => {
                const percent = Math.round((b.correct / b.total) * 100);
                return (
                  <div key={b.chapter} className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Chương {b.chapter}: {b.chapter === 1 ? 'Khái luận Triết học Mác - Lênin' : 'Chủ nghĩa duy vật biện chứng'}</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {b.correct}/{b.total} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {wrongQuestions.length > 0 && (
            <button
              onClick={handleSaveWrong}
              disabled={hasSavedWrong}
              className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-semibold text-xs transition-colors border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 disabled:opacity-60"
            >
              <BookMarked className="w-4 h-4" />
              <span>{hasSavedWrong ? 'Đã lưu vào sổ câu sai' : `Lưu ${wrongQuestions.length} câu sai vào sổ tay`}</span>
            </button>
          )}

          <button
            onClick={onRetake}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm shadow-indigo-500/20 flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Thi lại đề mới</span>
          </button>

          <button
            onClick={onGoHome}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Về tổng quan</span>
          </button>
        </div>
      </div>

      {/* Detailed Review Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Chi tiết câu trả lời & Lời giải
            </h3>
            <p className="text-xs text-slate-500">
              Xem lại từng câu để hiểu rõ căn cứ lý luận triết học
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs self-start sm:self-auto">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Tất cả ({result.questions.length})
            </button>
            <button
              onClick={() => setFilterMode('wrong')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterMode === 'wrong'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Câu sai ({result.wrongCount})
            </button>
            <button
              onClick={() => setFilterMode('correct')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterMode === 'correct'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Câu đúng ({result.correctCount})
            </button>
          </div>
        </div>

        {/* Question Cards List */}
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const userAns = result.userAnswers[q.id];
            const isCorrect = userAns !== undefined && userAns === q.correctIndex;
            const isUnanswered = userAns === undefined;
            const isExpanded = expandedExplanations[q.id] !== false; // expanded by default

            return (
              <div
                key={q.id}
                className={`rounded-2xl bg-white dark:bg-slate-900 border p-5 sm:p-6 transition-all ${
                  isCorrect
                    ? 'border-emerald-200 dark:border-emerald-900/60'
                    : 'border-rose-200 dark:border-rose-900/60'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {q.code}
                      </span>
                      <span>·</span>
                      <span>Chương {q.chapter}</span>
                      <span>·</span>
                      <span className="font-medium text-slate-600 dark:text-slate-400">{q.topic}</span>
                    </div>
                    <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
                      {q.question}
                    </h4>
                  </div>

                  <div className="shrink-0">
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <Check className="w-3.5 h-3.5" />
                        Đúng
                      </span>
                    ) : isUnanswered ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        Chưa chọn
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                        <X className="w-3.5 h-3.5" />
                        Sai
                      </span>
                    )}
                  </div>
                </div>

                {/* Options Review */}
                <div className="space-y-2 pt-3">
                  {q.options.map((opt, optIdx) => {
                    const label = ['A', 'B', 'C', 'D'][optIdx];
                    const isUserChoice = userAns === optIdx;
                    const isRightAnswer = q.correctIndex === optIdx;

                    let rowStyle = 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-slate-50/30 dark:bg-slate-800/20';
                    let badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';

                    if (isRightAnswer) {
                      rowStyle = 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500 font-medium';
                      badgeStyle = 'bg-emerald-600 text-white font-bold';
                    } else if (isUserChoice && !isRightAnswer) {
                      rowStyle = 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-1 ring-rose-500';
                      badgeStyle = 'bg-rose-600 text-white font-bold';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 ${rowStyle}`}
                      >
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0 ${badgeStyle}`}>
                          {label}
                        </span>
                        <div className="flex-1 pt-0.5 leading-relaxed">
                          {opt}
                        </div>
                        {isRightAnswer && (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap self-center">
                            Đáp án chuẩn ✓
                          </span>
                        )}
                        {isUserChoice && !isRightAnswer && (
                          <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap self-center">
                            Lựa chọn của bạn
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg">
                  <strong className="text-slate-800 dark:text-slate-200 font-semibold">Giải thích: </strong>
                  {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
