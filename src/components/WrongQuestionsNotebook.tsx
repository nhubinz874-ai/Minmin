import React, { useState } from 'react';
import { Question, UserStats } from '../types';
import { 
  AlertTriangle, 
  Trash2, 
  Play, 
  CheckCircle2, 
  BookOpen, 
  Check, 
  X, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface WrongQuestionsNotebookProps {
  allQuestions: Question[];
  stats: UserStats;
  onUpdateStats: (updater: (prev: UserStats) => UserStats) => void;
  onStartPracticeCustom: (questions: Question[]) => void;
}

export const WrongQuestionsNotebook: React.FC<WrongQuestionsNotebookProps> = ({
  allQuestions,
  stats,
  onUpdateStats,
  onStartPracticeCustom,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<0 | 1 | 2>(0);
  const [activeAnswers, setActiveAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const wrongQuestions = allQuestions.filter(q => stats.wrongQuestionIds.includes(q.id));
  
  const filteredWrong = wrongQuestions.filter(q => {
    if (selectedChapter !== 0) return q.chapter === selectedChapter;
    return true;
  });

  const handleRemove = (qId: string) => {
    onUpdateStats(prev => ({
      ...prev,
      wrongQuestionIds: prev.wrongQuestionIds.filter(id => id !== qId),
    }));
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách câu sai trong sổ tay không?')) {
      onUpdateStats(prev => ({
        ...prev,
        wrongQuestionIds: [],
      }));
    }
  };

  const handleAnswerQuestion = (q: Question, optIdx: number) => {
    setActiveAnswers(prev => ({ ...prev, [q.id]: optIdx }));
    if (optIdx === q.correctIndex) {
      // User mastered it! Option to auto remove or keep
    }
  };

  if (wrongQuestions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Sổ tay câu sai trống!
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Tuyệt vời! Hiện tại bạn chưa có câu hỏi nào làm sai, hoặc bạn đã ôn luyện và giải quyết hết các lỗi sai trước đây.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Sổ tay rèn luyện câu sai</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Cần khắc phục {wrongQuestions.length} câu hỏi
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Ôn lại các câu hỏi này là cách nhanh nhất để nâng cao điểm thi từ 8 lên 10.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onStartPracticeCustom(wrongQuestions)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm shadow-rose-500/20 flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Luyện {wrongQuestions.length} câu này ngay</span>
          </button>

          <button
            onClick={handleClearAll}
            title="Xóa toàn bộ câu sai"
            className="p-2.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chapter Filter */}
      <div className="flex items-center gap-2 text-xs font-medium">
        <button
          onClick={() => setSelectedChapter(0)}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            selectedChapter === 0
              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-semibold'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Tất cả ({wrongQuestions.length})
        </button>
        <button
          onClick={() => setSelectedChapter(1)}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            selectedChapter === 1
              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-semibold'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Chương 1 ({wrongQuestions.filter(q => q.chapter === 1).length})
        </button>
        <button
          onClick={() => setSelectedChapter(2)}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            selectedChapter === 2
              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-semibold'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Chương 2 ({wrongQuestions.filter(q => q.chapter === 2).length})
        </button>
      </div>

      {/* Wrong Questions List */}
      <div className="space-y-4">
        {filteredWrong.map((q) => {
          const userAns = activeAnswers[q.id];
          const hasAnswered = userAns !== undefined;
          const isRight = userAns === q.correctIndex;

          return (
            <div
              key={q.id}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{q.code}</span>
                    <span>·</span>
                    <span>Chương {q.chapter}</span>
                    <span>·</span>
                    <span className="font-medium text-slate-600 dark:text-slate-400">{q.topic}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
                    {q.question}
                  </h3>
                </div>

                <button
                  onClick={() => handleRemove(q.id)}
                  title="Đã thuộc, xóa khỏi sổ câu sai"
                  className="text-xs text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors shrink-0"
                >
                  <Check className="w-4 h-4" />
                  <span className="hidden sm:inline">Đã thành thạo</span>
                </button>
              </div>

              {/* Interactive Retry Options */}
              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const label = ['A', 'B', 'C', 'D'][optIdx];
                  const isSelected = userAns === optIdx;
                  const isCorrect = q.correctIndex === optIdx;

                  let optClass = 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60';
                  let badgeClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';

                  if (hasAnswered) {
                    if (isCorrect) {
                      optClass = 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-1 ring-emerald-500 font-medium';
                      badgeClass = 'bg-emerald-600 text-white font-bold';
                    } else if (isSelected && !isCorrect) {
                      optClass = 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 ring-1 ring-rose-500';
                      badgeClass = 'bg-rose-600 text-white font-bold';
                    } else {
                      optClass = 'opacity-50 border-slate-200 dark:border-slate-800 text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={hasAnswered}
                      onClick={() => handleAnswerQuestion(q, optIdx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-colors ${optClass}`}
                    >
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0 ${badgeClass}`}>
                        {label}
                      </span>
                      <span className="leading-relaxed pt-0.5">
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Master action */}
              {(hasAnswered || revealed[q.id]) && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs leading-relaxed animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      Đáp án đúng: <span className="text-emerald-600 dark:text-emerald-400">{['A', 'B', 'C', 'D'][q.correctIndex]}</span>
                    </div>
                    {isRight && (
                      <button
                        onClick={() => handleRemove(q.id)}
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Xóa khỏi sổ câu sai ngay</span>
                      </button>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    {q.explanation}
                  </p>
                </div>
              )}

              {!hasAnswered && !revealed[q.id] && (
                <div className="text-right">
                  <button
                    onClick={() => setRevealed(prev => ({ ...prev, [q.id]: true }))}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 ml-auto"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Xem lời giải</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
