import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Question, ExamConfig, ExamResult } from '../types';
import { 
  Clock, 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RotateCcw,
  Play
} from 'lucide-react';
import { formatTimer, calculateExamScore, createExamQuestions } from '../utils/examEngine';

interface ExamViewProps {
  allQuestions: Question[];
  initialConfig?: Partial<ExamConfig>;
  fontSize: 'normal' | 'large' | 'xlarge';
  onExamComplete: (result: ExamResult) => void;
  onExitExam: () => void;
}

export const ExamView: React.FC<ExamViewProps> = ({
  allQuestions,
  initialConfig,
  fontSize,
  onExamComplete,
  onExitExam,
}) => {
  const [isConfiguring, setIsConfiguring] = useState<boolean>(!initialConfig?.questionCount);
  const [config, setConfig] = useState<ExamConfig>({
    chapterFilter: initialConfig?.chapterFilter ?? 0,
    topicFilter: 'all',
    questionCount: initialConfig?.questionCount ?? 40,
    timeLimitMinutes: initialConfig?.timeLimitMinutes ?? 30,
    shuffleQuestions: true,
    shuffleOptions: true,
    practiceImmediateFeedback: false,
  });

  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(30 * 60);
  const [startTime, setStartTime] = useState<number>(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startExam = (cfg: ExamConfig) => {
    const qList = createExamQuestions(allQuestions, cfg);
    setExamQuestions(qList);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlagged({});
    const initialSeconds = (cfg.timeLimitMinutes || 30) * 60;
    setTimeRemaining(initialSeconds);
    setStartTime(Date.now());
    setIsConfiguring(false);
    setIsSubmitted(false);
  };

  useEffect(() => {
    if (initialConfig?.questionCount) {
      startExam({
        chapterFilter: initialConfig.chapterFilter ?? 0,
        topicFilter: 'all',
        questionCount: initialConfig.questionCount,
        timeLimitMinutes: initialConfig.timeLimitMinutes ?? 30,
        shuffleQuestions: true,
        shuffleOptions: true,
        practiceImmediateFeedback: false,
      });
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (isConfiguring || isSubmitted) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isConfiguring, isSubmitted]);

  const handleAutoSubmit = () => {
    finishExam();
  };

  const finishExam = () => {
    if (isSubmitted) return;
    setIsSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const totalTimeSeconds = Math.round((Date.now() - startTime) / 1000);
    const result = calculateExamScore(examQuestions, userAnswers, totalTimeSeconds);
    onExamComplete(result);
  };

  const toggleFlag = (qId: string) => {
    setFlagged(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const selectAnswer = (qId: string, optIdx: number) => {
    setUserAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const clearAnswer = (qId: string) => {
    setUserAnswers(prev => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  const textScaleClass = fontSize === 'large' ? 'text-base sm:text-lg' : fontSize === 'xlarge' ? 'text-lg sm:text-xl' : 'text-sm sm:text-base';
  const optionScaleClass = fontSize === 'large' ? 'text-base' : fontSize === 'xlarge' ? 'text-lg' : 'text-sm';

  // Configuration Screen
  if (isConfiguring) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Thiết lập phòng thi thử</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Kỳ thi trắc nghiệm Triết học Mác - Lênin
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cấu hình số câu hỏi, thời gian và phạm vi kiến thức phù hợp với mục tiêu ôn thi của bạn.
            </p>
          </div>

          <div className="space-y-5 pt-2">
            {/* Chapter Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Phạm vi kiến thức thi
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { value: 0, label: 'Toàn bộ 2 Chương', desc: '335 câu hỏi' },
                  { value: 1, label: 'Chương 1', desc: '95 câu hỏi' },
                  { value: 2, label: 'Chương 2', desc: '240 câu hỏi' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setConfig({ ...config, chapterFilter: item.value as 0 | 1 | 2 })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      config.chapterFilter === item.value
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-1 ring-indigo-600'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Số lượng câu hỏi
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[20, 30, 40, 50].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setConfig({ ...config, questionCount: num })}
                    className={`py-2.5 rounded-xl border text-center transition-all ${
                      config.questionCount === num
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-1 ring-indigo-600 font-bold text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    <div className="text-xs font-mono">{num} câu</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Limit */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Thời gian làm bài
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { mins: 15, label: '15 phút' },
                  { mins: 30, label: '30 phút' },
                  { mins: 45, label: '45 phút' },
                  { mins: 60, label: '60 phút' },
                ].map((item) => (
                  <button
                    key={item.mins}
                    type="button"
                    onClick={() => setConfig({ ...config, timeLimitMinutes: item.mins })}
                    className={`py-2.5 rounded-xl border text-center transition-all ${
                      config.timeLimitMinutes === item.mins
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-1 ring-indigo-600 font-bold text-indigo-700 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    <div className="text-xs font-mono">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Checkbox options */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.shuffleQuestions}
                  onChange={(e) => setConfig({ ...config, shuffleQuestions: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Xáo trộn thứ tự các câu hỏi trong đề
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.shuffleOptions}
                  onChange={(e) => setConfig({ ...config, shuffleOptions: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Xáo trộn thứ tự các đáp án A, B, C, D
                </span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onExitExam}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
            >
              Quay lại trang chủ
            </button>
            <button
              onClick={() => startExam(config)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Bắt đầu tính giờ thi</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ: Question | undefined = examQuestions[currentIndex];
  if (!currentQ) return null;

  const answeredCount = Object.keys(userAnswers).length;
  const isTimeCritical = timeRemaining < 300; // less than 5 minutes

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Sticky Exam Top Bar with Timer */}
      <div className="sticky top-16 z-30 flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
            Câu {currentIndex + 1} / {examQuestions.length}
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Đã làm: <strong className="text-indigo-600 dark:text-indigo-400">{answeredCount}</strong> / {examQuestions.length}
          </span>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono font-bold text-sm tabular-nums ${
            isTimeCritical
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 animate-pulse'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTimer(timeRemaining)}</span>
          </div>

          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-500/20 whitespace-nowrap"
          >
            Nộp bài
          </button>
        </div>
      </div>

      {/* Main Exam Area: 2 Columns (Question Card + Question Matrix Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left 3 Columns: Active Question Card */}
        <div className="lg:col-span-3 space-y-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{currentQ.code}</span>
                <span aria-hidden="true">·</span>
                <span>Chương {currentQ.chapter}</span>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{currentQ.topic}</span>
              </div>
              <h2 className={`font-semibold text-slate-900 dark:text-slate-100 leading-relaxed ${textScaleClass}`}>
                {currentQ.question}
              </h2>
            </div>

            <button
              onClick={() => toggleFlag(currentQ.id)}
              title={flagged[currentQ.id] ? 'Bỏ cờ đánh dấu' : 'Gắn cờ để kiểm tra lại'}
              className={`p-2.5 rounded-xl border transition-colors shrink-0 ${
                flagged[currentQ.id]
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Flag className={`w-4 h-4 ${flagged[currentQ.id] ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((optText, optIdx) => {
              const label = ['A', 'B', 'C', 'D'][optIdx];
              const isSelected = userAnswers[currentQ.id] === optIdx;

              return (
                <button
                  key={optIdx}
                  onClick={() => selectAnswer(currentQ.id, optIdx)}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 ring-1 ring-indigo-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {label}
                  </span>
                  <span className={`leading-relaxed pt-0.5 ${optionScaleClass}`}>
                    {optText}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Unselect helper if answered */}
          {userAnswers[currentQ.id] !== undefined && (
            <div className="text-right">
              <button
                onClick={() => clearAnswer(currentQ.id)}
                className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
              >
                Xóa lựa chọn của câu này
              </button>
            </div>
          )}

          {/* Bottom Nav Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Câu trước</span>
            </button>

            <button
              onClick={() => setCurrentIndex(Math.min(examQuestions.length - 1, currentIndex + 1))}
              disabled={currentIndex === examQuestions.length - 1}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Câu tiếp theo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right 1 Column: Question Matrix Grid */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Bảng ma trận câu hỏi
            </h3>
            <span className="text-xs font-mono text-slate-500">
              {answeredCount}/{examQuestions.length}
            </span>
          </div>

          {/* Grid buttons */}
          <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-1.5 max-h-[360px] overflow-y-auto p-1">
            {examQuestions.map((q, idx) => {
              const hasAnswer = userAnswers[q.id] !== undefined;
              const isFlag = flagged[q.id];
              const isCurrent = idx === currentIndex;

              let btnStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';

              if (hasAnswer) {
                btnStyle = 'bg-indigo-600 text-white border-indigo-700 font-bold';
              }

              if (isFlag) {
                btnStyle = 'bg-amber-500 text-white border-amber-600 font-bold';
              }

              if (isCurrent) {
                btnStyle += ' ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-8 rounded-lg border text-xs font-mono transition-all flex items-center justify-center relative ${btnStyle}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-indigo-600 shrink-0" />
              <span>Đã làm ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-amber-500 shrink-0" />
              <span>Gắn cờ ({Object.values(flagged).filter(Boolean).length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shrink-0" />
              <span>Chưa làm ({examQuestions.length - answeredCount})</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm shadow-emerald-500/20"
            >
              Nộp bài thi
            </button>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Xác nhận nộp bài thi?
                </h3>
                <p className="text-xs text-slate-500">
                  Còn lại {formatTimer(timeRemaining)} thời gian
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Tổng số câu:</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{examQuestions.length} câu</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Đã trả lời:</span>
                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{answeredCount} câu</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chưa trả lời:</span>
                <span className="font-bold font-mono text-rose-600 dark:text-rose-400">{examQuestions.length - answeredCount} câu</span>
              </div>
              {Object.values(flagged).filter(Boolean).length > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Đang gắn cờ xem lại:</span>
                  <span className="font-bold font-mono text-amber-600 dark:text-amber-400">{Object.values(flagged).filter(Boolean).length} câu</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Tiếp tục làm bài
              </button>
              <button
                onClick={() => {
                  setShowSubmitConfirm(false);
                  finishExam();
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
              >
                Đồng ý nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
