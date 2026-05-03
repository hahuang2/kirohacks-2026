import { useState, useEffect, useCallback } from 'react';

import ProblemDisplay from './components/ProblemDisplay.jsx';
import CodeEditor from './components/CodeEditor.jsx';
import ActionBar from './components/ActionBar.jsx';
import Timer from './components/Timer.jsx';
import TestResults from './components/TestResults.jsx';
import HintDisplay from './components/HintDisplay.jsx';
import DebriefPanel from './components/DebriefPanel.jsx';
import ProblemSelector from './components/ProblemSelector.jsx';
import LanguageSelector from './components/LanguageSelector.jsx';

import { runCode } from './runners/index.js';
import { generateHint } from './services/copilot.js';
import { generateDebrief } from './services/debrief.js';

export default function App() {
  const [problems, setProblems] = useState([]);
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [hints, setHints] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [view, setView] = useState('selection'); // "selection" | "coding" | "debrief"
  const [debriefData, setDebriefData] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [language, setLanguage] = useState('python');

  // Load all problems on mount
  useEffect(() => {
    async function loadProblems() {
      try {
        const data = await import('./data/problems.json');
        const loaded = data.default ?? data;
        if (!Array.isArray(loaded) || loaded.length === 0) {
          throw new Error('No problems found in problems.json');
        }
        setProblems(loaded);
      } catch (err) {
        setLoadError(err.message ?? 'Failed to load problems');
      }
    }
    loadProblems();
  }, []);

  const onSelectProblem = useCallback((selectedProblem) => {
    setProblem(selectedProblem);
    setCode(language === 'python' ? (selectedProblem.starterCodePython ?? '') : (selectedProblem.starterCode ?? ''));
    setTestResults([]);
    setHints([]);
    setElapsedTime(0);
    setDebriefData(null);
    setTimerRunning(true);
    setView('coding');
  }, [language]);

  const onChangeProblem = useCallback(() => {
    setProblem(null);
    setCode('');
    setTestResults([]);
    setHints([]);
    setElapsedTime(0);
    setDebriefData(null);
    setTimerRunning(false);
    setView('selection');
  }, []);

  const onLanguageChange = useCallback((newLanguage) => {
    setLanguage(newLanguage);
    if (problem) {
      setCode(newLanguage === 'python' ? (problem.starterCodePython ?? '') : (problem.starterCode ?? ''));
    }
  }, [problem]);

  const onCodeChange = useCallback((newCode) => {
    setCode(newCode);
  }, []);

  const onTick = useCallback((seconds) => {
    setElapsedTime(seconds);
  }, []);

  const onRun = useCallback(async () => {
    if (!problem || isRunning) return;
    setIsRunning(true);
    try {
      const results = await runCode({
        language,
        code,
        testCases: problem.sampleTestCases,
      });
      setTestResults(results);
    } catch (err) {
      setTestResults([]);
    } finally {
      setIsRunning(false);
    }
  }, [problem, code, isRunning, language]);

  const onSubmit = useCallback(async () => {
    if (!problem || isRunning) return;
    setIsRunning(true);
    try {
      const results = await runCode({
        language,
        code,
        testCases: problem.hiddenTestCases,
      });
      setTestResults(results);
      setTimerRunning(false);

      const debrief = generateDebrief({
        problem,
        code,
        results,
        elapsedTime,
        language,
      });
      setDebriefData(debrief);
      setView('debrief');
    } catch (err) {
      setTestResults([]);
    } finally {
      setIsRunning(false);
    }
  }, [problem, code, isRunning, elapsedTime, language]);

  const onGetHint = useCallback(() => {
    if (!problem || isRunning) return;
    const hint = generateHint({
      problem,
      code,
      previousHints: hints,
    });
    setHints((prev) => [...prev, hint]);
  }, [problem, code, hints, isRunning]);

  const onBackFromDebrief = useCallback(() => {
    setView('coding');
  }, []);

  // Selection view
  if (view === 'selection') {
    return (
      <div className="flex h-screen flex-col bg-gray-50">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <h1 className="text-xl font-bold text-gray-800">AlgoMentor</h1>
        </header>
        <main className="flex-1">
          {loadError ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-red-500">{loadError}</p>
            </div>
          ) : (
            <ProblemSelector problems={problems} onSelectProblem={onSelectProblem} />
          )}
        </main>
      </div>
    );
  }

  // Debrief view
  if (view === 'debrief' && debriefData) {
    return (
      <div className="flex h-screen flex-col bg-gray-50">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <h1 className="text-xl font-bold text-gray-800">AlgoMentor</h1>
          <div className="flex items-center gap-3">
            <Timer running={false} elapsedTime={elapsedTime} onTick={onTick} />
            <button
              onClick={onChangeProblem}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Change Problem
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <DebriefPanel debrief={debriefData} onBack={onBackFromDebrief} />
        </main>
      </div>
    );
  }

  // Coding view
  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <h1 className="text-xl font-bold text-gray-800">AlgoMentor</h1>
        <div className="flex items-center gap-3">
          <Timer running={timerRunning} elapsedTime={elapsedTime} onTick={onTick} />
          <button
            onClick={onChangeProblem}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Change Problem
          </button>
        </div>
      </header>

      {/* Action bar */}
      <ActionBar
        onRun={onRun}
        onSubmit={onSubmit}
        onGetHint={onGetHint}
        isRunning={isRunning}
      />

      {/* Split pane: Problem (left) + Editor (right) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left pane — Problem */}
        <div className="w-1/2 overflow-y-auto border-r border-gray-200 bg-white">
          <ProblemDisplay problem={problem} loadError={loadError} />
        </div>

        {/* Right pane — Editor + results */}
        <div className="flex w-1/2 flex-col overflow-hidden">
          {/* Language selector — top of editor pane */}
          <div className="flex shrink-0 items-center border-b border-gray-200 bg-white px-3 py-1.5">
            <LanguageSelector language={language} onChange={onLanguageChange} />
          </div>

          <div className="flex-1 overflow-hidden">
            <CodeEditor code={code} onChange={onCodeChange} language={language} />
          </div>

          {/* Test results — compact, scrollable */}
          <div className="h-24 shrink-0 overflow-y-auto border-t border-gray-200 bg-white">
            <TestResults results={testResults} />
          </div>

          {/* Hints */}
          <div className="h-28 shrink-0 overflow-y-auto border-t border-gray-200 bg-white">
            <HintDisplay hints={hints} />
          </div>
        </div>
      </div>
    </div>
  );
}
