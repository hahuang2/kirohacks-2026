/**
 * ApproachCard renders a single alternative approach with its metadata
 * and an optional code snippet in a read-only Monaco Editor.
 *
 * Props:
 *   approach — AlternativeApproach object with name, description,
 *              timeComplexity, spaceComplexity, and optional codeSolutions
 */

import { useState } from 'react';
import Editor from '@monaco-editor/react';

function hasCodeSolutions(codeSolutions) {
  return (
    codeSolutions != null &&
    typeof codeSolutions === 'object' &&
    Object.keys(codeSolutions).length > 0
  );
}

function getDefaultLanguage(codeSolutions) {
  const keys = Object.keys(codeSolutions);
  if (keys.includes('javascript')) return 'javascript';
  return keys[0];
}

function getEditorHeight(code) {
  const lineCount = (code || '').split('\n').length;
  return Math.min(Math.max(lineCount * 19 + 20, 80), 400);
}

export default function ApproachCard({ approach }) {
  const { name, description, timeComplexity, spaceComplexity, codeSolutions } = approach;

  const showCode = hasCodeSolutions(codeSolutions);
  const languages = showCode ? Object.keys(codeSolutions) : [];

  const [selectedLanguage, setSelectedLanguage] = useState(() =>
    showCode ? getDefaultLanguage(codeSolutions) : ''
  );

  const code = showCode ? codeSolutions[selectedLanguage] || '' : '';
  const editorHeight = getEditorHeight(code);

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
      <p className="font-medium text-gray-800">{name}</p>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
      <p className="mt-1 text-xs text-gray-500">
        Time: {timeComplexity} · Space: {spaceComplexity}
      </p>

      {showCode && (
        <div className="mt-3">
          {/* Language selector tabs */}
          <div className="flex gap-1">
            {languages.map((lang) => (
              <button
                key={lang}
                data-testid={`lang-tab-${lang}`}
                onClick={() => setSelectedLanguage(lang)}
                className={`rounded-t px-3 py-1 text-xs font-medium transition-colors ${
                  selectedLanguage === lang
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Read-only Monaco Editor */}
          <div
            className="overflow-hidden rounded-b border border-gray-200"
            style={{ height: `${editorHeight}px` }}
          >
            <Editor
              height="100%"
              language={selectedLanguage}
              value={code}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                fontSize: 13,
                domReadOnly: true,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
