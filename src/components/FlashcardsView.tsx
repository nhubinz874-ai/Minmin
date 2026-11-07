import React, { useState } from 'react';
import { Flashcard, UserStats } from '../types';
import { 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  RotateCcw, 
  Shuffle, 
  Layers, 
  Sparkles,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { shuffleArray } from '../utils/examEngine';

interface FlashcardsViewProps {
  cards: Flashcard[];
  stats: UserStats;
  onUpdateStats: (updater: (prev: UserStats) => UserStats) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  cards,
  stats,
  onUpdateStats,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<0 | 1 | 2>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [activeCards, setActiveCards] = useState<Flashcard[]>(cards);

  const filteredCards = activeCards.filter(c => {
    if (selectedChapter !== 0) return c.chapter === selectedChapter;
    return true;
  });

  const currentCard: Flashcard | undefined = filteredCards[currentIndex];

  const handleShuffle = () => {
    setActiveCards(shuffleArray(activeCards));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleToggleMastered = (cardId: string) => {
    onUpdateStats(prev => {
      const isMastered = prev.masteredFlashcardIds.includes(cardId);
      return {
        ...prev,
        masteredFlashcardIds: isMastered
          ? prev.masteredFlashcardIds.filter(id => id !== cardId)
          : [...prev.masteredFlashcardIds, cardId]
      };
    });
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((currentIndex + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const masteredCount = cards.filter(c => stats.masteredFlashcardIds.includes(c.id)).length;
  const progressPercent = Math.round((masteredCount / cards.length) * 100);

  if (!currentCard) {
    return (
      <div className="py-16 text-center text-slate-500">
        Không có thẻ ghi nhớ nào trong danh mục này.
      </div>
    );
  }

  const isCurrentMastered = stats.masteredFlashcardIds.includes(currentCard.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Top Bar with Filter & Progress */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => { setSelectedChapter(0); setCurrentIndex(0); setIsFlipped(false); }}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedChapter === 0
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Tất cả ({cards.length})
            </button>
            <button
              onClick={() => { setSelectedChapter(1); setCurrentIndex(0); setIsFlipped(false); }}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedChapter === 1
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Chương 1
            </button>
            <button
              onClick={() => { setSelectedChapter(2); setCurrentIndex(0); setIsFlipped(false); }}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedChapter === 2
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Chương 2
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="text-right">
            <span className="text-slate-500">Đã thuộc: </span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{masteredCount}</strong>/{cards.length}
          </div>
          <button
            onClick={handleShuffle}
            title="Xáo trộn thẻ"
            className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setIsFlipped(!isFlipped); } }}
        className="group cursor-pointer select-none rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 p-8 sm:p-10 shadow-md min-h-[360px] flex flex-col justify-between transition-all duration-300"
      >
        {/* Top Header of Card */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold font-mono">
              {currentCard.category}
            </span>
            <span>·</span>
            <span>Chương {currentCard.chapter}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
            <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
            <span>Bấm để lật</span>
          </div>
        </div>

        {/* Center Content: Front vs Back */}
        <div className="my-auto py-6 text-center space-y-4">
          {!isFlipped ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Thuật ngữ / Khái niệm
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                {currentCard.term}
              </h2>
              <p className="text-xs text-slate-500 pt-2">
                Nhấn vào thẻ hoặc phím Space để xem định nghĩa và phân tích
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-left animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Định nghĩa chuẩn
                </div>
                <p className="text-sm sm:text-base text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                  {currentCard.definition}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs space-y-1">
                <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Điểm mấu chốt khi thi:</span>
                </div>
                <p className="text-amber-900 dark:text-amber-200 leading-relaxed">
                  {currentCard.keyTakeaway}
                </p>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong>Ví dụ thực tiễn: </strong>
                {currentCard.example}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Card Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-mono font-medium text-slate-400">
            Thẻ {currentIndex + 1} / {filteredCards.length}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleMastered(currentCard.id);
            }}
            className={`px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 transition-colors ${
              isCurrentMastered
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isCurrentMastered ? 'Đã thuộc thẻ này' : 'Đánh dấu đã thuộc'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Thẻ trước</span>
        </button>

        <button
          onClick={handleNext}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-sm shadow-indigo-500/20 flex items-center gap-1.5"
        >
          <span>Thẻ tiếp theo</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
