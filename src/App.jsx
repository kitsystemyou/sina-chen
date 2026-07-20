import React, { useState, useRef } from 'react';
import { extractTextFromPdf } from './utils/pdfParser';
import { computeDiff } from './utils/diffEngine';

function App() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [diffResult, setDiffResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterImportantOnly, setFilterImportantOnly] = useState(false);

  const handleFileChange = (e, setFile) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e, setFile) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setFile(file);
      } else {
        setError('PDFファイルのみ対応しています。');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleCompare = async () => {
    if (!file1 || !file2) return;
    
    setLoading(true);
    setError('');
    
    try {
      const text1 = await extractTextFromPdf(file1);
      const text2 = await extractTextFromPdf(file2);
      
      const diffs = computeDiff(text1, text2);
      setDiffResult(diffs);
    } catch (err) {
      setError(err.message || '差分抽出中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>シナチェン！</h1>
        <div style={{ fontSize: '1.2rem', color: 'var(--primary-hover)', margin: '-0.5rem 0 1.5rem 0', fontWeight: '500', letterSpacing: '1px' }}>
          Scenario Change Viewer
        </div>
        <p>新旧のシナリオPDFを比較し、判定や条件の変更点を強調表示します。</p>
      </div>

      <div className="glass-panel">
        {error && (
          <div style={{ color: '#e74c3c', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div className="upload-section">
          {/* Before File */}
          <div 
            className={`drop-zone ${file1 ? 'file-selected' : ''}`}
            onDrop={(e) => handleDrop(e, setFile1)}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('file1-upload').click()}
          >
            <input 
              type="file" 
              id="file1-upload" 
              accept="application/pdf"
              onChange={(e) => handleFileChange(e, setFile1)} 
            />
            {file1 ? (
              <>
                <strong>{file1.name}</strong>
                <p>変更前シナリオ</p>
              </>
            ) : (
              <>
                <strong>変更前（旧）シナリオを選択</strong>
                <p>またはドラッグ＆ドロップしてください</p>
              </>
            )}
          </div>

          {/* After File */}
          <div 
            className={`drop-zone ${file2 ? 'file-selected' : ''}`}
            onDrop={(e) => handleDrop(e, setFile2)}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('file2-upload').click()}
          >
            <input 
              type="file" 
              id="file2-upload" 
              accept="application/pdf"
              onChange={(e) => handleFileChange(e, setFile2)} 
            />
            {file2 ? (
              <>
                <strong>{file2.name}</strong>
                <p>変更後シナリオ</p>
              </>
            ) : (
              <>
                <strong>変更後（新）シナリオを選択</strong>
                <p>またはドラッグ＆ドロップしてください</p>
              </>
            )}
          </div>
        </div>

        <div className="diff-controls">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <button 
              className="btn-primary" 
              onClick={handleCompare}
              disabled={!file1 || !file2 || loading}
            >
              {loading ? (
                <><span className="loading-spinner"></span> 解析中...</>
              ) : (
                '差分を確認する'
              )}
            </button>

            {diffResult && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold', color: 'var(--text-main)', background: 'rgba(255,255,255,0.6)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <input 
                  type="checkbox" 
                  checked={filterImportantOnly}
                  onChange={(e) => setFilterImportantOnly(e.target.checked)}
                  style={{ transform: 'scale(1.2)' }}
                />
                ★ TRPGで重要そうな変更のみを表示
              </label>
            )}
          </div>

          <div className="legend">
            <div className="legend-item">
              <span className="legend-color added"></span>
              <span className="legend-text"><strong style={{color: '#8FBC8F'}}>+</strong> 追加された内容</span>
            </div>
            <div className="legend-item">
              <span className="legend-color removed"></span>
              <span className="legend-text"><strong style={{color: '#E53935'}}>-</strong> 削除された内容</span>
            </div>
            <div className="legend-item">
              <span className="legend-color trpg"></span>
              <span className="legend-text"><strong style={{color: '#EBB066'}}>★</strong> TRPGで重要そうな変更</span>
            </div>
          </div>
        </div>

        {diffResult && (
          <div className="diff-result">
            <div className="diff-header">
              <div className="diff-header-col">比較結果（★印はTRPGの重要な変更点です）</div>
            </div>
            <div className="diff-content">
              {diffResult.map((part, index) => {
                if (filterImportantOnly && !part.isImportant) {
                  return null;
                }

                let className = 'diff-line';
                if (part.added) className += ' diff-added';
                if (part.removed) className += ' diff-removed';
                if (part.isImportant) className += ' diff-trpg-important';

                // 変更のない長いテキストは省略するか、そのまま表示するか
                // 今回はシンプルにすべて表示します
                
                // 何も変更がない部分は灰色に近づける
                const style = (!part.added && !part.removed) ? { color: '#888' } : {};

                // ページマーカーを抽出して分割
                const chunks = part.value.split(/\[---PAGE_MARKER:\s*(\d+)\s*---\]/);

                if (chunks.length === 1) {
                  return (
                    <div key={index} className={className} style={style}>
                      {part.value}
                    </div>
                  );
                }

                const elements = [];
                for (let j = 0; j < chunks.length; j++) {
                  if (j % 2 === 0) {
                    if (chunks[j]) {
                      elements.push(<span key={`text-${j}`}>{chunks[j]}</span>);
                    }
                  } else {
                    elements.push(
                      <div key={`page-${j}-${chunks[j]}`} className="page-indicator" style={{color: '#7A9D96'}}>
                        <span>Page {chunks[j]}</span>
                      </div>
                    );
                  }
                }

                return (
                  <div key={index} className={className} style={style}>
                    {elements}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
