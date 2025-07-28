import { fetchGameManualData, GameManualData } from './gameManualService';

export interface ParsedSection {
  title: string;
  content: string;
  keywords: string[];
  rules: string[];
}

export interface ParsedGameManual {
  title: string;
  version: string;
  lastUpdated: string;
  sections: {
    [key: string]: ParsedSection;
  };
  keywords: string[];
}

// Keywords for different types of questions
const QUESTION_KEYWORDS = {
  scoring: ['score', 'scoring', 'points', 'goal', 'trough', 'block', 'autonomous', 'bonus'],
  safety: ['safety', 'glasses', 'adult', 'field', 'boundary', 'participant', 'release'],
  field: ['field', 'dimension', 'block', 'mass', 'goal', 'zone', 'modification', 'repair'],
  tournament: ['tournament', 'competition', 'referee', 'head', 'alliance', 'skills', 'challenge'],
  robot: ['robot', 'inspection', 'size', 'mechanism', 'motor', 'brain', 'controller', 'autonomous'],
  general: ['rule', 'game', 'match', 'period', 'timeout', 'disqualification', 'violation'],
  parts: ['part', 'component', 'motor', 'brain', 'controller', 'mechanism', 'design'],
  strategy: ['strategy', 'tactic', 'approach', 'planning', 'alliance', 'coordination']
};

export class GameManualParser {
  private manualData: GameManualData | null = null;
  private parsedData: ParsedGameManual | null = null;

  async loadManual(): Promise<void> {
    this.manualData = await fetchGameManualData();
    this.parseManual();
  }

  private parseManual(): void {
    if (!this.manualData) return;

    const sections: { [key: string]: ParsedSection } = {};
    
    // Parse each section from the manual data
    Object.entries(this.manualData.sections).forEach(([key, content]) => {
      sections[key] = this.parseSection(key, content);
    });

    this.parsedData = {
      title: this.manualData.title,
      version: this.manualData.version,
      lastUpdated: this.manualData.lastUpdated,
      sections,
      keywords: this.extractKeywords(this.manualData.content)
    };
  }

  private parseSection(sectionName: string, content: string): ParsedSection {
    const lines = content.split('\n').filter(line => line.trim());
    const rules: string[] = [];
    const keywords: string[] = [];

    lines.forEach(line => {
      if (line.includes('•') || line.includes('-')) {
        rules.push(line.trim());
      }
      // Extract keywords from the line
      const words = line.toLowerCase().match(/\b\w+\b/g) || [];
      keywords.push(...words.filter(word => word.length > 3));
    });

    return {
      title: this.getSectionTitle(sectionName),
      content,
      keywords: [...new Set(keywords)],
      rules
    };
  }

  private getSectionTitle(sectionName: string): string {
    const titles: { [key: string]: string } = {
      scoring: 'Scoring Rules',
      safety: 'Safety Rules',
      field: 'Field Specifications',
      tournament: 'Tournament Rules',
      robot: 'Robot Rules',
      general: 'General Game Rules',
      parts: 'Robot Parts & Design',
      strategy: 'Competition Strategy'
    };
    return titles[sectionName] || sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
  }

  private extractKeywords(content: string): string[] {
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    return [...new Set(words.filter(word => word.length > 3))];
  }

  async findRelevantInformation(query: string): Promise<string[]> {
    if (!this.parsedData) {
      await this.loadManual();
    }

    if (!this.parsedData) return [];

    const lowerQuery = query.toLowerCase();
    const relevantSections: string[] = [];

    // Check which sections are most relevant based on keywords
    Object.entries(QUESTION_KEYWORDS).forEach(([sectionKey, keywords]) => {
      const hasRelevantKeywords = keywords.some(keyword => 
        lowerQuery.includes(keyword)
      );
      
      if (hasRelevantKeywords && this.parsedData!.sections[sectionKey]) {
        relevantSections.push(this.parsedData!.sections[sectionKey].content);
      }
    });

    // If no specific section matches, search through all content
    if (relevantSections.length === 0) {
      Object.values(this.parsedData!.sections).forEach(section => {
        if (section.content.toLowerCase().includes(lowerQuery)) {
          relevantSections.push(section.content);
        }
      });
    }

    return relevantSections;
  }

  async getSpecificRule(query: string): Promise<string | null> {
    if (!this.parsedData) {
      await this.loadManual();
    }

    if (!this.parsedData) return null;

    const lowerQuery = query.toLowerCase();
    
    // Search through all sections for specific rules
    for (const section of Object.values(this.parsedData.sections)) {
      for (const rule of section.rules) {
        if (rule.toLowerCase().includes(lowerQuery)) {
          return `${section.title}:\n${rule}`;
        }
      }
    }

    return null;
  }

  async getSectionContent(sectionName: string): Promise<string | null> {
    if (!this.parsedData) {
      await this.loadManual();
    }

    return this.parsedData?.sections[sectionName]?.content || null;
  }

  async getRandomTip(): Promise<string> {
    if (!this.parsedData) {
      await this.loadManual();
    }

    if (!this.parsedData) return '';

    const sections = Object.values(this.parsedData.sections);
    const randomSection = sections[Math.floor(Math.random() * sections.length)];
    const randomRule = randomSection.rules[Math.floor(Math.random() * randomSection.rules.length)];
    
    return `${randomSection.title}:\n${randomRule}`;
  }

  async searchByKeyword(keyword: string): Promise<string[]> {
    if (!this.parsedData) {
      await this.loadManual();
    }

    if (!this.parsedData) return [];

    const results: string[] = [];
    const lowerKeyword = keyword.toLowerCase();

    Object.values(this.parsedData.sections).forEach(section => {
      if (section.keywords.includes(lowerKeyword) || 
          section.content.toLowerCase().includes(lowerKeyword)) {
        results.push(section.content);
      }
    });

    return results;
  }
}

// Export a singleton instance
export const gameManualParser = new GameManualParser(); 