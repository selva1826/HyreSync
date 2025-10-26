import fs from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import path from 'path';

/**
 * Extract text from PDF or DOCX files
 */
class FileParser {
  async extractText(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    try {
      if (ext === '.pdf') {
        return await this.extractFromPDF(filePath);
      } else if (ext === '.docx' || ext === '.doc') {
        return await this.extractFromDOCX(filePath);
      } else {
        throw new Error('Unsupported file format');
      }
    } catch (error) {
      console.error('File parsing error:', error);
      throw new Error(`Failed to parse resume: ${error.message}`);
    }
  }

  async extractFromPDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }

  async extractFromDOCX(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }
}

export default new FileParser();
