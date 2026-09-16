import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List } from 'lucide-react';

export default function RichTextEditor({ value, onChange, placeholder, minHeight = '100px' }) {
  const editorRef = useRef(null);
  
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (!value) {
        editorRef.current.innerHTML = '';
      } else if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  const handleInput = () => {
    onChange(editorRef.current.innerHTML);
  };

  const format = (command) => {
    document.execCommand(command, false, null);
    editorRef.current.focus();
    handleInput();
  };

  return (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
      <div style={{ display: 'flex', gap: '4px', padding: '8px', borderBottom: '1px solid var(--border-color)', background: '#f8fafc' }}>
        <button type="button" onClick={() => format('bold')} style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }} title="Negrito">
          <Bold size={16} color="var(--text-main)" />
        </button>
        <button type="button" onClick={() => format('italic')} style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }} title="Itálico">
          <Italic size={16} color="var(--text-main)" />
        </button>
        <button type="button" onClick={() => format('underline')} style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }} title="Sublinhado">
          <Underline size={16} color="var(--text-main)" />
        </button>
        <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 4px' }}></div>
        <button type="button" onClick={() => format('insertUnorderedList')} style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }} title="Lista">
          <List size={16} color="var(--text-main)" />
        </button>
      </div>
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        style={{ padding: '12px', minHeight, outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.5' }}
        data-placeholder={placeholder}
      />
      <style>{`
        div[contentEditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
          display: block;
        }
      `}</style>
    </div>
  );
}
