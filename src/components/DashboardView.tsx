import React from 'react';
import { ViewMode, UserStats, Question, ExamResult } from '../types';
import { 
  Play, 
  BookOpen, 
  Clock, 
  Award, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  TrendingUp,
  Brain,
  Layers,
  Search,
  Sparkles
} from 'lucide-react';
import { getScoreGrade, formatTimer } from '../utils/examEngine';

interface DashboardViewProps {
  stats: UserStats;
  allQuestions: Question[];
  onSelectView: (view: ViewMode) => void;
  onStartExam: (chapterFilter: 0 | 1 | 2, count: number, timeLimit: number | null) => void;
  onStartPractice: (chapterFilter: 0 | 1 | 2) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  allQuestions,
  onSelectView,
  onStartExam,
  onStartPractice,
}) => {
  const ch1Questions = allQuestions.filter(q => q.chapter === 1);
  const ch2Questions = allQuestions.filter(q => q.chapter === 2);
  
  const accuracy = stats.totalPracticed > 0 
    ? Math.round((stats.correctAnswersCount / stats.totalPracticed) * 100) 
    : 0;

  const latestExam: ExamResult | undefined = stats.examHistory[stats.examHistory.length - 1];
  const highestScore = stats.examHistory.length > 0 
    ? Math.max(...stats.examHistory.map(h => h.score))
    : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white p-6 sm:p-8 lg:p-10 shadow-lg border border-indigo-900/40">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Hệ thống Ôn thi Trắc nghiệm Đại học • Học phần BAS 123</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Luyện thi Triết học Mác - Lênin chuẩn đề thi ngân hàng
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Học phần bắt buộc trang bị thế giới quan và phương pháp luận khoa học. Trọn bộ <span className="text-amber-400 font-semibold font-mono">335 câu hỏi trắc nghiệm</span> chính thức (Chương 1 & Chương 2) có đáp án chuẩn, giải thích chuyên sâu và chế độ thi thử tính giờ y như thi thật.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onStartExam(0, 40, 30)}
              className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-all shadow-md hover:shadow-indigo-500/25 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Thi thử 40 câu (30 phút)</span>
            </button>

            <button
              onClick={() => onStartPractice(0)}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm transition-all border border-white/10 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Luyện tập tự do</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative background glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-12 -bottom-12 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      </section>

      {/* Progress & Quick Metrics Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ngân hàng câu hỏi</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              335 <span className="text-xs font-normal text-slate-400 font-sans">câu</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Chương 1 (95) · Chương 2 (240)</div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tỷ lệ chính xác</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {accuracy}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Đã luyện {stats.totalPracticed} lượt</div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Điểm thi cao nhất</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {highestScore > 0 ? highestScore.toFixed(1) : '--'}<span className="text-xs font-normal text-slate-400 font-sans">/10</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {stats.examHistory.length} lần làm bài thi
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Chuỗi học tập</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {stats.streakDays} <span className="text-xs font-normal text-slate-400 font-sans">ngày liên tục</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Duy trì để giữ vững phong độ</div>
          </div>
        </div>
      </section>

      {/* Main Study Hub Modules Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Chọn chế độ ôn tập
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">Đa dạng phương pháp ôn thi hiệu quả</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Exam Mode */}
          <div className="group rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Phòng Thi Thử Tính Giờ
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Mô phỏng kỳ thi kết thúc học phần với đồng hồ đếm ngược, ma trận câu hỏi và xếp loại điểm số ngay khi nộp bài.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">30 - 45 phút</span>
              <button
                onClick={() => onStartExam(0, 40, 30)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Vào thi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Chapter 1 Practice */}
          <div className="group rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Ôn Luyện Chương 1 (95 câu)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Khái luận về triết học và triết học Mác - Lênin: Thế giới quan, vấn đề cơ bản, các trường phái triết học, tiền đề ra đời.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">95 câu hỏi</span>
              <button
                onClick={() => onStartPractice(1)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Luyện Chương 1</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Chapter 2 Practice */}
          <div className="group rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Ôn Luyện Chương 2 (240 câu)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Chủ nghĩa duy vật biện chứng: Vật chất và ý thức, 2 nguyên lý, 6 cặp phạm trù, 3 quy luật lớn, lý luận nhận thức và thực tiễn.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">240 câu hỏi</span>
              <button
                onClick={() => onStartPractice(2)}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Luyện Chương 2</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 4: Sổ tay câu sai */}
          <div className="group rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-rose-300 dark:hover:border-rose-700 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  Sổ Tay Câu Sai
                </h3>
                {stats.wrongQuestionIds.length > 0 && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400">
                    {stats.wrongQuestionIds.length} câu
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tập trung rèn luyện các câu bạn từng làm sai. Khắc phục triệt để lỗ hổng kiến thức để không bao giờ mất điểm oan.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Ôn trọng tâm</span>
              <button
                onClick={() => onSelectView('wrong_book')}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Mở sổ câu sai</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 5: Flashcards */}
          <div className="group rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-300 dark:hover:border-amber-700 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Thẻ Ghi Nhớ Flashcards
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                16 thẻ ghi nhớ tương tác lật mặt về các định nghĩa kinh điển (Vật chất Lênin, Vận động, 2 Nguyên lý, 3 Quy luật, Thực tiễn).
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">16 khái niệm</span>
              <button
                onClick={() => onSelectView('flashcards')}
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Học flashcard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 6: Tra cứu & Lý thuyết */}
          <div className="group rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-300 dark:hover:border-purple-700 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Tra Cứu Đề & Sơ Đồ Lý Thuyết
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tra cứu nhanh theo từ khóa trong toàn bộ 335 câu hỏi, kèm bảng tóm tắt lý thuyết cô đọng, dễ hiểu trước giờ thi.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Toàn văn & Sơ đồ</span>
              <button
                onClick={() => onSelectView('theory')}
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Tra cứu ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Exam History */}
      {stats.examHistory.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Lịch sử thi thử gần đây
            </h2>
            <span className="text-xs text-slate-500 font-mono">Đã làm {stats.examHistory.length} bài thi</span>
          </div>

          <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                  <tr>
                    <th className="py-3 px-4">Thời gian</th>
                    <th className="py-3 px-4">Số câu</th>
                    <th className="py-3 px-4">Điểm số</th>
                    <th className="py-3 px-4">Đúng / Sai</th>
                    <th className="py-3 px-4">Thời gian làm</th>
                    <th className="py-3 px-4">Xếp loại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.examHistory.slice(-5).reverse().map((exam) => {
                    const gradeInfo = getScoreGrade(exam.score);
                    const formattedDate = new Date(exam.date).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <tr key={exam.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                          {formattedDate}
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-mono">
                          {exam.totalQuestions} câu
                        </td>
                        <td className="py-3 px-4 font-bold text-sm text-slate-900 dark:text-white font-mono tabular-nums">
                          {exam.score.toFixed(1)} / 10
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">{exam.correctCount}</span> đúng · <span className="text-rose-600 dark:text-rose-400 font-semibold font-mono">{exam.wrongCount}</span> sai
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">
                          {formatTimer(exam.timeSpentSeconds)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${gradeInfo.badgeColor}`}>
                            {gradeInfo.grade}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
