// Project: AI Quiz Generator
import { NextResponse } from 'next/server';
import pdf from 'pdf-extraction';
import mammoth from 'mammoth';
import { TextDecoder } from 'util';
import { generateQuestionsFromText } from '@/lib/generateQuestionsFromText';

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('file');
  const inputText = formData.get('text');

  let extractedText = inputText?.trim().replace(/\n/g, ' ') || '';

  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.name.split('.').pop().toLowerCase();

    try {
      if (fileType === 'pdf') {
        const pdfData = await pdf(buffer);
        extractedText = pdfData.text;
      } else if (fileType === 'docx') {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } else if (fileType === 'txt') {
        const decoder = new TextDecoder('utf-8');
        extractedText = decoder.decode(buffer);
      } else {
        return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
      }
    } catch (err) {
      console.error('Error processing file:', err);
      return NextResponse.json({ error: 'Failed to process uploaded file.' }, { status: 500 });
    }
  }

  if (!extractedText || extractedText.length < 50) {
    return NextResponse.json({ error: 'Insufficient content to generate questions.' }, { status: 400 });
  }

  const chunks = chunkText(extractedText, 1500);
  const questionChunks = await Promise.all(chunks.map(chunk => generateQuestionsFromText(chunk)));

  const flatQuestions = questionChunks.flat();
  const uniqueQuestions = Array.from(new Set(flatQuestions.map(q => JSON.stringify(q)))).map(q => JSON.parse(q));
  const limitedQuestions = uniqueQuestions.slice(0, 20);

  return NextResponse.json({ questions: limitedQuestions });
}

function chunkText(text, maxLength = 1500) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  let currentChunk = "";

  for (let sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
