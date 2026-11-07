import React, { useState, useMemo, useEffect } from 'react';
import { Question, UserStats } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Bookmark, 
  Shuffle, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  ListFilter, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { shuffleArray } from '../utils/examEngine';

interface PracticeViewProps {
  allQuestions: Question[];
  initialChapter: 0 | 1 | 2;
  stats: UserStats;
  fontSize: 'normal' | 'large' | 'xlarge';
  onUpdateStats: (updater: (prev: UserStats) => UserStats) => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  allQuestions,
  initialChapter,
  stats,
  fontSize,
  onUpdateStats,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<0 | 1 | 2>(initialChapter);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [showImmediateFeedback, setShowImmediateFeedback] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [showDrawer, setShowDrawer] = useState<boolean>(false);

  // Available topics for selected chapter
  const topics = useMemo(() => {
    let pool = allQuestions;
    if (selectedChapter !== 0) {
      pool = pool.filter(q => q.chapter === selectedChapter);
    }
    return Array.from(new Set(pool.map(q => q.topic)));
  }, [allQuestions, selectedChapter]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    let pool = allQuestions;
    if (selectedChapter !== 0) {
      pool = pool.filter(q => q.chapter === selectedChapter);
    }
    if (selectedTopic !== 'all') {
      pool = pool.filter(q => q.topic === selectedTopic);
    }
    return isShuffled ? shuffleArray(pool) : pool;
  }, [allQuestions, selectedChapter, selectedTopic, isShuffled]);

  // Adjust index if out of bounds
  useEffect(() => {
    if (currentIndex >= filteredQuestions.length && filteredQuestions.length > 0) {
      setCurrentIndex(0);
    }
  }, [filteredQuestions.length, currentIndex]);

  const currentQuestion: Question | undefined = filteredQuestions[currentIndex];

  const handleSelectOption = (optionIndex: number) => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    if (answers[qId] !== undefined) return; // already answered

    const newAnswers = { ...answers, [qId]: optionIndex };
    setAnswers(newAnswers);

    const isCorrect = optionIndex === currentQuestion.correctIndex;

    // Update global user stats
    onUpdateStats((prev) => {
      const alreadyWrong = prev.wrongQuestionIds.includes(qId);
      let updatedWrong = prev.wrongQuestionIds;
      if (!isCorrect && !alreadyWrong) {
        updatedWrong = [...updatedWrong, qId];
      } else if (isCorrect && alreadyWrong) {
        // user got it right now, could keep or remove based on preference
      }

      return {
        ...prev,
        totalPracticed: prev.totalPracticed + 1,
        correctAnswersCount: isCorrect ? prev.correctAnswersCount + 1 : prev.correctAnswersCount,
        wrongQuestionIds: updatedWrong,
      };
    });
  };

  const handleToggleBookmark = (qId: string) => {
    onUpdateStats((prev) => {
      const isBookmarked = prev.bookmarkedQuestionIds.includes(qId);
      return {
        ...prev,
        bookmarkedQuestionIds: isBookmarked
          ? prev.bookmarkedQuestionIds.filter((id) => id !== qId)
          : [...prev.bookmarkedQuestionIds, qId],
      };
    });
  };

  const handleResetPractice = () => {
    if (window.confirm('Bạn có muốn đặt lại toàn bộ tiến độ làm bài của phần luyện tập này không?')) {
      setAnswers({});
      setRevealed({});
      setCurrentIndex(0);
    }
  };

  const textScaleClass = fontSize === 'large' ? 'text-base sm:text-lg' : fontSize === 'xlarge' ? 'text-lg sm:text-xl' : 'text-sm sm:text-base';
  const optionScaleClass = fontSize === 'large' ? 'text-base' : fontSize === 'xlarge' ? 'text-lg' : 'text-sm';

  if (!currentQuestion) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Không tìm thấy câu hỏi phù hợp</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Vui lòng thử chọn lại chương hoặc chủ đề khác để tiếp tục ôn tập.
        </p>
        <button
          onClick={() => { setSelectedChapter(0); setSelectedTopic('all'); }}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
        >
          Đặt lại bộ lọc
        </button>
      </div>
    );
  }

  const isBookmarked = stats.bookmarkedQuestionIds.includes(currentQuestion.id);
  const selectedAns = answers[currentQuestion.id];
  const isAnswered = selectedAns !== undefined;
  const isCorrect = selectedAns === currentQuestion.correctIndex;
  const showExplanation = (showImmediateFeedback && isAnswered) || revealed[currentQuestion.id];

  const totalAnsweredInPool = Object.keys(answers).filter(id => filteredQuestions.some(q => q.id === id)).length;
  const totalCorrectInPool = Object.entries(answers).filter(([id, ans]) => {
    const q = filteredQuestions.find(item => item.id === id);
    return q && q.correctIndex === ans;
  }).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Filters & Toolbar Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Chapter Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => { setSelectedChapter(0); setSelectedTopic('all'); }}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                selectedChapter === 0
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Tất cả (335)
            </button>
            <button
              onClick={() => { setSelectedChapter(1); setSelectedTopic('all'); }}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                selectedChapter === 1
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Chương 1 (95)
            </button>
            <button
              onClick={() => { setSelectedChapter(2); setSelectedTopic('all'); }}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                selectedChapter === 2
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Chương 2 (240)
            </button>
          </div>

          {/* Topic Selector */}
          {topics.length > 1 && (
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Tất cả chủ đề ({topics.length})</option>
              {topics.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
        </div>

        {/* Practice Mode Options */}
        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <button
            onClick={() => setShowImmediateFeedback(!showImmediateFeedback)}
            title={showImmediateFeedback ? 'Đang bật: Hiện kết quả ngay khi chọn' : 'Đang tắt: Ẩn kết quả'}
            className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 ${
              showImmediateFeedback
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {showImmediateFeedback ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showImmediateFeedback ? 'Phản hồi tức thì' : 'Tự kiểm tra'}</span>
          </button>

          <button
            onClick={() => setIsShuffled(!isShuffled)}
            title="Xáo trộn ngẫu nhiên thứ tự câu hỏi"
            className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 ${
              isShuffled
                ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xáo trộn</span>
          </button>

          <button
            onClick={() => setShowDrawer(!showDrawer)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Danh sách</span>
          </button>
        </div>
      </div>

      {/* Progress Bar & Counter */}
      <div className="flex items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
            Câu {currentIndex + 1} <span className="font-normal text-slate-400">/ {filteredQuestions.length}</span>
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-600 dark:text-slate-400 font-mono">
            Đã làm: <strong className="text-slate-800 dark:text-slate-200">{totalAnsweredInPool}</strong> (Đúng: <strong className="text-emerald-600 dark:text-emerald-400">{totalCorrectInPool}</strong>)
          </span>
        </div>

        <button
          onClick={handleResetPractice}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Làm lại từ đầu</span>
        </button>
      </div>

      {/* Question Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Question Meta & Actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{currentQuestion.code}</span>
              <span aria-hidden="true">·</span>
              <span>Chương {currentQuestion.chapter}</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{currentQuestion.topic}</span>
            </div>
            <h2 className={`font-semibold text-slate-900 dark:text-slate-100 leading-relaxed ${textScaleClass}`}>
              {currentQuestion.question}
            </h2>
          </div>

          <button
            onClick={() => handleToggleBookmark(currentQuestion.id)}
            title={isBookmarked ? 'Bỏ lưu câu hỏi này' : 'Lưu câu hỏi để ôn lại'}
            aria-label="Lưu câu hỏi"
            className={`p-2.5 rounded-xl border transition-colors shrink-0 ${
              isBookmarked
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {currentQuestion.options.map((optText, optIdx) => {
            const label = ['A', 'B', 'C', 'D'][optIdx];
            const isSelected = selectedAns === optIdx;
            const isThisCorrect = currentQuestion.correctIndex === optIdx;

            let optionStyle = 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200';
            let badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';

            if (isAnswered && showImmediateFeedback) {
              if (isThisCorrect) {
                optionStyle = 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500';
                badgeStyle = 'bg-emerald-600 text-white';
              } else if (isSelected && !isThisCorrect) {
                optionStyle = 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-1 ring-rose-500';
                badgeStyle = 'bg-rose-600 text-white';
              } else {
                optionStyle = 'opacity-60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400';
              }
            } else if (isSelected) {
              optionStyle = 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-500';
              badgeStyle = 'bg-indigo-600 text-white';
            }

            return (
              <button
                key={optIdx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${optionStyle}`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${badgeStyle}`}>
                  {isAnswered && showImmediateFeedback && isThisCorrect ? (
                    <Check className="w-4 h-4" />
                  ) : isAnswered && showImmediateFeedback && isSelected && !isThisCorrect ? (
                    <X className="w-4 h-4" />
                  ) : (
                    label
                  )}
                </span>
                <span className={`leading-relaxed pt-0.5 ${optionScaleClass}`}>
                  {optText}
                </span>
              </button>
            );
          })}
        </div>

        {/* Non-immediate feedback: Toggle reveal button */}
        {!showImmediateFeedback && isAnswered && !revealed[currentQuestion.id] && (
          <button
            onClick={() => setRevealed({ ...revealed, [currentQuestion.id]: true })}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Xem đáp án đúng & Giải thích</span>
          </button>
        )}

        {/* Explanation Card */}
        {showExplanation && (
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              {isCorrect ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Chính xác!
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Chưa chính xác! Đáp án đúng là {['A', 'B', 'C', 'D'][currentQuestion.correctIndex]}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Câu trước</span>
          </button>

          <button
            onClick={() => setCurrentIndex((currentIndex + 1) % filteredQuestions.length)}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-500/20"
          >
            <span>Câu tiếp theo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Drawer / Palette Modal */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Danh sách câu hỏi ({filteredQuestions.length} câu)
              </h3>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                {filteredQuestions.map((q, idx) => {
                  const ans = answers[q.id];
                  const hasAnswered = ans !== undefined;
                  const right = ans === q.correctIndex;
                  const isCurrent = idx === currentIndex;

                  let btnBg = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                  if (hasAnswered) {
                    btnBg = right
                      ? 'bg-emerald-500 text-white border-emerald-600 font-bold'
                      : 'bg-rose-500 text-white border-rose-600 font-bold';
                  }
                  if (isCurrent) {
                    btnBg += ' ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowDrawer(false);
                      }}
                      className={`h-9 rounded-lg border text-xs font-mono transition-all flex items-center justify-center ${btnBg}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-around text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span>Đúng</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-rose-500" />
                <span>Sai</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700" />
                <span>Chưa làm</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
