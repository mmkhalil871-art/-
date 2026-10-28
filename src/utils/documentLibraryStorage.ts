import { savePdfToStorage, getPdfFromStorage, deletePdfFromStorage, formatFileSize } from './pdfStorage';
import { MinisterialDecision } from '../types/decision';

export interface StoredDocumentItem {
  id: string; // decisionId or documentId
  filename: string;
  size: number;
  uploadedAt: string;
  docType: 'scanned_pdf' | 'written_word' | 'text';
  decisionId: string;
  decisionNumber: string;
  decisionTitle: string;
  category: string;
  relatedLawArticles: string[];
}

/**
 * Collects a structured list of all documents currently held in the library
 */
export function getDocumentsLibraryList(decisions: MinisterialDecision[]): StoredDocumentItem[] {
  const items: StoredDocumentItem[] = [];

  for (const dec of decisions) {
    if (dec.pdfAttachment) {
      items.push({
        id: `pdf-${dec.id}`,
        filename: dec.pdfAttachment.filename,
        size: dec.pdfAttachment.size,
        uploadedAt: dec.pdfAttachment.uploadedAt,
        docType: 'scanned_pdf',
        decisionId: dec.id,
        decisionNumber: dec.decisionNumber,
        decisionTitle: dec.title,
        category: dec.category,
        relatedLawArticles: dec.relatedLawArticles,
      });
    }

    // Every decision with written text can also be considered a structured Word document record
    if (dec.articles && dec.articles.length > 0) {
      const estimatedSize = JSON.stringify(dec.articles).length * 2;
      items.push({
        id: `word-${dec.id}`,
        filename: `قرار_وزير_العمل_${dec.decisionNumber}_لسنة_${dec.year}.docx`,
        size: estimatedSize > 1024 ? estimatedSize : 4096,
        uploadedAt: dec.updatedAt || dec.createdAt,
        docType: 'written_word',
        decisionId: dec.id,
        decisionNumber: dec.decisionNumber,
        decisionTitle: dec.title,
        category: dec.category,
        relatedLawArticles: dec.relatedLawArticles,
      });
    }
  }

  return items;
}

export { savePdfToStorage, getPdfFromStorage, deletePdfFromStorage, formatFileSize };
