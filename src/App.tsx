/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Question, ViewMode, UserStats, ExamResult, ExamConfig } from './types';
import allQuestionsRaw from './data/questions.json';
import { flashcardsData } from './data/flashcards';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PracticeView } from './components/PracticeView';
import { ExamView } from './components/ExamView';
import { ExamResultModal } from './components/ExamResultModal';
import { WrongQuestionsNotebook } from './components/WrongQuestionsNotebook';
import { FlashcardsView } from './components/FlashcardsView';
import { TheoryAndSearch } from './components/TheoryAndSearch';
import { 
  loadUserStats, 
  saveUserStats, 
  loadSettings, 
  saveSettings, 
  updateStreak, 
  AppSettings 
} from './utils/storage';
import { Sparkles, BookOpen, Clock, Heart } from 'lucide-react';

const allQuestions = allQuestionsRaw as Question[];

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [practiceChapter, setPracticeChapter] = useState<0 | 1 | 2>(0);
  const [customPracticePool, setCustomPracticePool] = useState<Question[] | null>(null);
  
  const [examConfig, setExamConfig] = useState<Partial<ExamConfig> | null>(null);
  const [latestExamResult, setLatestExamResult] = useState<ExamResult | null>(null);

  const [stats, setStats] = useState<UserStats>(() => {
    const loaded = loadUserStats();
    return updateStreak(loaded);
  });

  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  // Handle URL parameters (e.g. ?autostart=1 or ?mode=exam)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' || params.get('mode') === 'exam') {
      setExamConfig({ questionCount: 20, timeLimitMinutes: 15, chapterFilter: 0 });
      setCurrentView('exam');
    } else if (params.get('mode') === 'practice') {
      setPracticeChapter(1);
      setCurrentView('practice');
    }
  }, []);

  // Sync dark mode class on mount and change
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const handleUpdateSettings = (newPartial: Partial<AppSettings>) => {
    const updated = { ...settings, ...newPartial };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleUpdateStats = (updater: (prev: UserStats) => UserStats) => {
    setStats((prev) => {
      const updated = updater(prev);
      saveUserStats(updated);
      return updated;
    });
  };

  const handleStartExam = (chapterFilter: 0 | 1 | 2, count: number, timeLimit: number | null) => {
    setLatestExamResult(null);
    setExamConfig({
      chapterFilter,
      questionCount: count,
      timeLimitMinutes: timeLimit,
      shuffleQuestions: true,
      shuffleOptions: true,
      practiceImmediateFeedback: false,
    });
    setCurrentView('exam');
  };

  const handleStartPractice = (chapterFilter: 0 | 1 | 2) => {
    setCustomPracticePool(null);
    setPracticeChapter(chapterFilter);
    setCurrentView('practice');
  };

  const handleStartCustomPractice = (questions: Question[]) => {
    setCustomPracticePool(questions);
    setCurrentView('practice');
  };

  const handleExamComplete = (result: ExamResult) => {
    setLatestExamResult(result);
    // Automatically record exam into stats
    handleUpdateStats((prev) => {
      const wrongIds = result.questions
        .filter((q) => {
          const ans = result.userAnswers[q.id];
          return ans === undefined || ans !== q.correctIndex;
        })
        .map((q) => q.id);

      const combinedWrong = Array.from(new Set([...prev.wrongQuestionIds, ...wrongIds]));

      return {
        ...prev,
        totalPracticed: prev.totalPracticed + result.totalQuestions,
        correctAnswersCount: prev.correctAnswersCount + result.correctCount,
        wrongQuestionIds: combinedWrong,
        examHistory: [...prev.examHistory, result],
      };
    });
  };

  const handleSaveWrongFromExam = (wrongIds: string[]) => {
    handleUpdateStats((prev) => ({
      ...prev,
      wrongQuestionIds: Array.from(new Set([...prev.wrongQuestionIds, ...wrongIds])),
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header */}
      <Header
        currentView={currentView}
        onSelectView={(view) => {
          setLatestExamResult(null);
          setExamConfig(null);
          setCurrentView(view);
        }}
        wrongCount={stats.wrongQuestionIds.length}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onStartExamModal={() => handleStartExam(0, 40, 30)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {latestExamResult ? (
          <ExamResultModal
            result={latestExamResult}
            onRetake={() => handleStartExam(0, latestExamResult.totalQuestions, 30)}
            onGoHome={() => {
              setLatestExamResult(null);
              setCurrentView('dashboard');
            }}
            onSaveWrongQuestions={handleSaveWrongFromExam}
          />
        ) : currentView === 'dashboard' ? (
          <DashboardView
            stats={stats}
            allQuestions={allQuestions}
            onSelectView={setCurrentView}
            onStartExam={handleStartExam}
            onStartPractice={handleStartPractice}
          />
        ) : currentView === 'practice' ? (
          <PracticeView
            allQuestions={customPracticePool || allQuestions}
            initialChapter={practiceChapter}
            stats={stats}
            fontSize={settings.fontSize}
            onUpdateStats={handleUpdateStats}
          />
        ) : currentView === 'exam' ? (
          <ExamView
            allQuestions={allQuestions}
            initialConfig={examConfig || {}}
            fontSize={settings.fontSize}
            onExamComplete={handleExamComplete}
            onExitExam={() => {
              setExamConfig(null);
              setCurrentView('dashboard');
            }}
          />
        ) : currentView === 'wrong_book' ? (
          <WrongQuestionsNotebook
            allQuestions={allQuestions}
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onStartPracticeCustom={handleStartCustomPractice}
          />
        ) : currentView === 'flashcards' ? (
          <FlashcardsView
            cards={flashcardsData}
            stats={stats}
            onUpdateStats={handleUpdateStats}
          />
        ) : currentView === 'theory' ? (
          <TheoryAndSearch allQuestions={allQuestions} />
        ) : null}
      </main>

      {/* Clean Academic Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">TriếtHọc Pro</span>
            <span>—</span>
            <span>Học phần Triết học Mác - Lênin (BAS 123)</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>335 câu hỏi chuẩn</span>
            <span>·</span>
            <span>Chương 1 & Chương 2</span>
            <span>·</span>
            <span>Giải thích chuẩn giáo trình Bộ GD&ĐT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
