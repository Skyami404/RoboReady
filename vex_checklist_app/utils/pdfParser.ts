import { fetchGameManualData } from './gameManualService';

export interface PDFSection {
  title: string;
  content: string;
  pageNumber?: number;
  keywords: string[];
}

export interface ParsedPDF {
  title: string;
  version: string;
  sections: PDFSection[];
  fullText: string;
}

export class PDFParser {
  private cachedData: ParsedPDF | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  async parseGameManual(): Promise<ParsedPDF> {
    const now = Date.now();
    
    // Return cached data if it's still fresh
    if (this.cachedData && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      return this.cachedData;
    }

    try {
      // In a real implementation, this would use a PDF parsing library
      // For now, we'll simulate parsing the official game manual
      const manualData = await fetchGameManualData();
      
      const sections: PDFSection[] = [
        {
          title: "Scoring Rules",
          content: manualData.sections.scoring || "Scoring information not available",
          pageNumber: 22,
          keywords: ['score', 'scoring', 'points', 'goal', 'trough', 'block', 'autonomous', 'bonus']
        },
        {
          title: "Safety Rules", 
          content: manualData.sections.safety || "Safety information not available",
          pageNumber: 27,
          keywords: ['safety', 'glasses', 'adult', 'field', 'boundary', 'participant', 'release']
        },
        {
          title: "Field Specifications",
          content: manualData.sections.field || "Field specifications not available", 
          pageNumber: 45,
          keywords: ['field', 'dimension', 'block', 'mass', 'goal', 'zone', 'modification', 'repair']
        },
        {
          title: "Tournament Rules",
          content: manualData.sections.tournament || "Tournament rules not available",
          pageNumber: 68,
          keywords: ['tournament', 'competition', 'referee', 'head', 'alliance', 'skills', 'challenge']
        },
        {
          title: "Robot Rules",
          content: manualData.sections.robot || "Robot rules not available",
          pageNumber: 45,
          keywords: ['robot', 'inspection', 'size', 'mechanism', 'motor', 'brain', 'controller', 'autonomous']
        },
        {
          title: "General Game Rules",
          content: manualData.sections.general || "General game rules not available",
          pageNumber: 32,
          keywords: ['rule', 'game', 'match', 'period', 'timeout', 'disqualification', 'violation']
        }
      ];

      const parsedPDF: ParsedPDF = {
        title: manualData.title,
        version: manualData.version,
        sections,
        fullText: manualData.content
      };

      this.cachedData = parsedPDF;
      this.lastFetchTime = now;
      
      return parsedPDF;
    } catch (error) {
      console.error('Error parsing game manual PDF:', error);
      throw new Error('Failed to parse game manual PDF');
    }
  }

  async searchInPDF(query: string): Promise<PDFSection[]> {
    const pdf = await this.parseGameManual();
    const lowerQuery = query.toLowerCase();
    const results: PDFSection[] = [];

    // Search through sections
    pdf.sections.forEach(section => {
      if (section.content.toLowerCase().includes(lowerQuery) ||
          section.title.toLowerCase().includes(lowerQuery) ||
          section.keywords.some(keyword => lowerQuery.includes(keyword))) {
        results.push(section);
      }
    });

    return results;
  }

  async getSectionByTitle(title: string): Promise<PDFSection | null> {
    const pdf = await this.parseGameManual();
    return pdf.sections.find(section => 
      section.title.toLowerCase().includes(title.toLowerCase())
    ) || null;
  }

  async getSectionByKeyword(keyword: string): Promise<PDFSection[]> {
    const pdf = await this.parseGameManual();
    const lowerKeyword = keyword.toLowerCase();
    
    return pdf.sections.filter(section =>
      section.keywords.some(k => k.includes(lowerKeyword)) ||
      section.content.toLowerCase().includes(lowerKeyword)
    );
  }

  async getRandomSection(): Promise<PDFSection | null> {
    const pdf = await this.parseGameManual();
    if (pdf.sections.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * pdf.sections.length);
    return pdf.sections[randomIndex];
  }

  async getFullText(): Promise<string> {
    const pdf = await this.parseGameManual();
    return pdf.fullText;
  }

  async getManualInfo(): Promise<{ title: string; version: string }> {
    const pdf = await this.parseGameManual();
    return {
      title: pdf.title,
      version: pdf.version
    };
  }
}

// Export a singleton instance
export const pdfParser = new PDFParser(); 