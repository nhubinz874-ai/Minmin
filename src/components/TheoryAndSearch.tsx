import React, { useState, useMemo } from 'react';
import { Question } from '../types';
import { theorySectionsData } from '../data/theoryNotes';
import { 
  Search, 
  BookOpen, 
  Filter, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';

interface TheoryAndSearchProps {
  allQuestions: Question[];
}

export const TheoryAndSearch: React.FC<TheoryAndSearchProps> = ({ allQuestions }) => {
  const [activeTab, setActiveTab] = useState<'search' | 'theory'>('search');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<0 | 1 | 2>(0);
  const [showAnswerByDefault, setShowAnswerByDefault] = useState<boolean>(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  // Theory expanded state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'ch1_intro': true,
    'ch2_matter_consciousness': true,
  });

  const topics = useMemo(() => {
    let pool = allQuestions;
    if (selectedChapter !== 0) pool = pool.filter(q => q.chapter === selectedChapter);
    return Array.from(new Set(pool.map(q => q.topic)));
  }, [allQuestions, selectedChapter]);

  const searchResults = useMemo(() => {
    return allQuestions.filter(q => {
      if (selectedChapter !== 0 && q.chapter !== selectedChapter) return false;
      if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;
      if (!searchQuery.trim()) return true;

      const qText = q.question.toLowerCase();
      const code = q.code.toLowerCase();
      const opts = q.options.join(' ').toLowerCase();
      const term = searchQuery.toLowerCase();

      return qText.includes(term) || code.includes(term) || opts.includes(term);
    });
  }, [allQuestions, selectedChapter, selectedTopic, searchQuery]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Tab Switcher Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'search'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Tra cứu 335 câu hỏi</span>
          </button>

          <button
            onClick={() => setActiveTab('theory')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'theory'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Sơ đồ lý thuyết ôn tập</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 font-mono hidden sm:inline">
          {activeTab === 'search' ? `Tìm thấy ${searchResults.length} câu` : 'Tóm tắt trọng tâm'}
        </span>
      </div>

      {/* TAB 1: SEARCH QUESTION BANK */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Search bar & filters */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập từ khóa tìm kiếm (ví dụ: vật chất, Lênin, mâu thuẫn, lượng - chất, thực tiễn...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                {/* Chapter Filter */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <button
                    onClick={() => { setSelectedChapter(0); setSelectedTopic('all'); }}
                    className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      selectedChapter === 0
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Tất cả (335)
                  </button>
                  <button
                    onClick={() => { setSelectedChapter(1); setSelectedTopic('all'); }}
                    className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      selectedChapter === 1
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Chương 1 (95)
                  </button>
                  <button
                    onClick={() => { setSelectedChapter(2); setSelectedTopic('all'); }}
                    className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      selectedChapter === 2
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Chương 2 (240)
                  </button>
                </div>

                {/* Topic Filter */}
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="all">Tất cả chủ đề</option>
                  {topics.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Show Answer Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400 font-medium">
                <input
                  type="checkbox"
                  checked={showAnswerByDefault}
                  onChange={(e) => setShowAnswerByDefault(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Luôn hiện đáp án đúng</span>
              </label>
            </div>
          </div>

          {/* Search Result Count */}
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Hiển thị <strong>{searchResults.length}</strong> / 335 câu hỏi
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {searchResults.map((q) => (
              <div
                key={q.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-3"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{q.code}</span>
                  <span>·</span>
                  <span>Chương {q.chapter}</span>
                  <span>·</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{q.topic}</span>
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                  {q.question}
                </h3>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const label = ['A', 'B', 'C', 'D'][optIdx];
                    const isCorrect = q.correctIndex === optIdx;

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                          showAnswerByDefault && isCorrect
                            ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-medium'
                            : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold shrink-0 ${
                          showAnswerByDefault && isCorrect
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {label}
                        </span>
                        <div className="flex-1 pt-0.5 leading-relaxed">
                          {opt}
                        </div>
                        {showAnswerByDefault && isCorrect && (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 self-center" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {showAnswerByDefault && (
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                    {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: STRUCTURED THEORY NOTES */}
      {activeTab === 'theory' && (
        <div className="space-y-6">
          {/* Comparison Matrix Table Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Bảng so sánh cốt lõi thường gặp trong đề thi</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Tiêu chí so sánh</th>
                    <th className="py-2.5 px-3">Phương pháp Siêu hình</th>
                    <th className="py-2.5 px-3">Phương pháp Biện chứng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">Trạng thái sự vật</td>
                    <td className="py-2.5 px-3">Xem xét cô lập, tách rời, tĩnh tại, bất biến</td>
                    <td className="py-2.5 px-3">Xem xét trong mối liên hệ phổ biến, vận động, phát triển</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">Nguồn gốc vận động</td>
                    <td className="py-2.5 px-3">Nằm bên ngoài sự vật (cú hích của Thượng đế, ngoại lực)</td>
                    <td className="py-2.5 px-3">Mâu thuẫn nội tại, sự đấu tranh giữa các mặt đối lập bên trong</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">Hình ảnh ẩn dụ</td>
                    <td className="py-2.5 px-3">"Chỉ thấy cây mà không thấy rừng"</td>
                    <td className="py-2.5 px-3">"Không ai tắm hai lần trên một dòng sông"</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Three Laws Comparison */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Ba Quy Luật Cơ Bản của Phép Biện Chứng Duy Vật
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-xs space-y-1">
                  <div className="font-bold text-indigo-700 dark:text-indigo-300">1. Quy luật Lượng - Chất</div>
                  <div className="text-slate-600 dark:text-slate-400">
                    Chỉ ra <strong>cách thức, phương thức</strong> của sự vận động và phát triển (Độ → Điểm nút → Bước nhảy).
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 text-xs space-y-1">
                  <div className="font-bold text-purple-700 dark:text-purple-300">2. Quy luật Mâu thuẫn</div>
                  <div className="text-slate-600 dark:text-slate-400">
                    <strong>Hạt nhân cơ bản</strong>; chỉ ra <strong>nguồn gốc và động lực bên trong</strong> của sự phát triển.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 text-xs space-y-1">
                  <div className="font-bold text-emerald-700 dark:text-emerald-300">3. Phủ định của Phủ định</div>
                  <div className="text-slate-600 dark:text-slate-400">
                    Chỉ ra <strong>khuynh hướng, xu hướng</strong> phát triển tiến lên theo <strong>đường xoáy ốc</strong>.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Chapter Sections Accordion */}
          <div className="space-y-4">
            {theorySectionsData.map((sec) => {
              const isOpen = expandedSections[sec.id] !== false;

              return (
                <div
                  key={sec.id}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => toggleSection(sec.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                        Ch{sec.chapter}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        {sec.title}
                      </h3>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {isOpen && (
                    <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 space-y-5 bg-slate-50/30 dark:bg-slate-900/30">
                      {sec.keyPoints.map((pt, pIdx) => (
                        <div key={pIdx} className="space-y-2">
                          <h4 className="text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>{pt.heading}</span>
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {pt.content}
                          </p>
                          {pt.highlights && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {pt.highlights.map((h, hIdx) => (
                                <span
                                  key={hIdx}
                                  className="text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5"
                                >
                                  {h}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
