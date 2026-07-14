import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker for Vite
// In typical Vite setup for modern pdfjs-dist
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const extractTextFromPdf = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // テキストアイテムのY座標を見て改行を挿入するなどの工夫も可能ですが、
      // 簡単のためスペース区切りで結合し、ページごとに改行します。
      let lastY = -1;
      let pageText = '';
      
      for (const item of textContent.items) {
        if (lastY !== item.transform[5] && lastY !== -1) {
          pageText += '\n';
        } else if (lastY !== -1) {
          pageText += ' ';
        }
        pageText += item.str;
        lastY = item.transform[5];
      }
      
      fullText += `\n[---PAGE_MARKER: ${i}---]\n` + pageText + '\n\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('PDFの読み込みに失敗いたしました。パスワード等がかかっていないかご確認くださいませ。');
  }
};
