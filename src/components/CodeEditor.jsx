/**
 * CodeEditor wraps @monaco-editor/react with dynamic language support.
 *
 * Props:
 *   code     — Current editor content (string)
 *   onChange  — Callback invoked with the new content when the user edits code
 *   language — "python" | "javascript" — Monaco language mode for syntax highlighting
 */

import Editor from '@monaco-editor/react';

export default function CodeEditor({ code, onChange, language }) {
  function handleEditorChange(value) {
    onChange(value ?? '');
  }

  return (
    <section
      className="h-full w-full"
      aria-label="Code editor"
    >
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
        }}
      />
    </section>
  );
}
