import React from 'react';
import MonacoEditor from '@monaco-editor/react';

function Editor({ code, setCode }) {
  return (
    <div className="flex-1 w-full h-[450px]">
      <MonacoEditor
        height="100%"
        theme="vs-dark"
        defaultLanguage="javascript" // Autodetect happens in backend
        defaultValue={code}
        onChange={(val) => setCode(val || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16 }
        }}
      />
    </div>
  );
}

export default Editor;
