import pdf from 'pdf-parse';

/**
 * Extracts text from a PDF buffer.
 * @param {Buffer} buffer - The PDF file as a Buffer.
 * @returns {Promise<string>} - The extracted text.
 */
export async function extractTextFromPDF(buffer) {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return '';
  }
}
