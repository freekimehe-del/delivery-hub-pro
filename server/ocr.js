// OCR helper: tries to use tesseract.js if available, otherwise falls back to a simple mock
let hasTesseract = false;
let createWorker = null;

try {
   
  const tesseract = require('tesseract.js');
  createWorker = tesseract.createWorker;
  hasTesseract = true;
} catch (e) {
  hasTesseract = false;
}

async function recognizeBuffer(buffer) {
  if (!buffer) return '';
  if (hasTesseract && createWorker) {
    const worker = createWorker({ logger: () => {} });
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data } = await worker.recognize(buffer);
    await worker.terminate();
    return data && data.text ? data.text : '';
  }

  // Fallback: try to infer simple text from buffer filename or basic content
  try {
    const s = buffer.toString('utf8').slice(0, 1000);
    return s || '';
  } catch (e) {
    return '';
  }
}

module.exports = { recognizeBuffer };
