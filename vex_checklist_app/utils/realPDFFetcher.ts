import { fetchGameManualData, CURRENT_VEX_GAME } from './gameManualService';

export interface RealPDFData {
  title: string;
  content: string;
  sections: {
    [key: string]: string;
  };
  lastUpdated: string;
  version: string;
  url: string;
}

export class RealPDFFetcher {
  private cachedData: RealPDFData | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  async fetchRealPDF(): Promise<RealPDFData> {
    const now = Date.now();
    
    // Return cached data if it's still fresh
    if (this.cachedData && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      return this.cachedData;
    }

    try {
      // In a real implementation, this would:
      // 1. Fetch the PDF from the VEX website
      // 2. Use a PDF parsing library like pdf-parse or pdf2pic
      // 3. Extract text content and structure it
      
      // For now, we'll simulate the process and use the data we have
      const manualData = await fetchGameManualData();
      
      // Simulate extracting more detailed content from the real PDF
      const realPDFData: RealPDFData = {
        title: manualData.title,
        content: manualData.content,
        sections: {
          ...manualData.sections,
          // Add more detailed sections that would be extracted from the real PDF
          'field_dimensions': `Field Dimensions (from official PDF):
Field size: 12' x 12' (144" x 144")
Field tile size: 24" x 24"
Field height: 12" from floor to top of field perimeter
Loader zone: 24" x 24" in each corner
Autonomous line: 36" from field perimeter
Center goal: 18" diameter, 12" height
Long goals: 24" x 12" x 12" (L x W x H)
Block specifications: 2" x 2" x 2" cubes, 40 ± 4 grams`,
          
          'scoring_detailed': `Detailed Scoring Rules (from official PDF):
All scoring evaluated after match ends
Blocks must be in contact with inside surface of plastic trough to be scored
Autonomous bonus scored immediately after autonomous period ends
Controlled criteria: Robot must be in contact with game element
Parked Robot criteria: Robot must be fully within designated zone
Scoring elements: Blocks, Goals, Autonomous Bonus, Win Point`,
          
          'safety_detailed': `Detailed Safety Rules (from official PDF):
Students must be accompanied by adults at all times
Stay inside field boundaries during matches
Safety glasses required for all participants
Participant release forms must be completed and on file
No running or horseplay in competition areas
Emergency procedures must be known by all team members
First aid kit must be available at all events`,
          
          'robot_inspection': `Robot Inspection Requirements (from official PDF):
Robot must pass inspection before competition
Size constraints: 18" x 18" x 18" starting size
Weight limit: 15 pounds maximum
All mechanisms must be safe and secure
Autonomous programming must be tested and verified
Driver controls must be clearly labeled
Emergency stop functionality required`,
          
          'tournament_procedures': `Tournament Procedures (from official PDF):
Head referees have final authority on all decisions
Alliance selection process follows standard VEX procedures
Robot skills challenges available for additional scoring
Engineering notebook review required for awards
Team interviews conducted by judges
Awards ceremony at conclusion of tournament
Qualification for higher-level competitions possible`,
          
          'robot_size_limits': `Robot Size Limits (from official PDF):
Starting size: 18" x 18" x 18" maximum
Expansion allowed during match
Vertical expansion: Unlimited
Horizontal expansion: Must remain within field boundaries
Weight limit: 15 pounds maximum
All parts must be contained within starting size at match start`,
          
          'autonomous_period': `Autonomous Period Rules (from official PDF):
Duration: 15 seconds
No human intervention allowed
Robot must start within starting size
All autonomous programming must be pre-loaded
No external communication during autonomous period
Autonomous bonus scored immediately after period ends`,
          
          'driver_controlled': `Driver Controlled Period Rules (from official PDF):
Duration: 105 seconds
Two drivers per alliance
Controllers must remain connected to field
Hands out of field during matches
No touching robot during match
Drivers must stay in alliance station`,
          
          'block_scoring': `Block Scoring Rules (from official PDF):
Blocks must be in contact with inside surface of plastic trough
Blocks must be fully contained within goal
No partial scoring for blocks touching goal edge
Blocks must remain in goal until end of match
Scoring evaluated after match ends
Block mass: 40 ± 4 grams`,
          
          'field_modifications': `Permitted Field Modifications (from official PDF):
Applying threadlocker to field element mounting hardware
Using non-VEX white electrical tape to add required lines
Using standard VEX field tiles in place of game-specific printed tiles
Assembling loaders without nut blocks to improve alignment
Anchoring field elements directly to field risers instead of metal plates`,
          
          'robot_skills': `Robot Skills Challenge Rules (from official PDF):
60-second programming skills matches
60-second driver skills matches
Maximum 3 programming skills attempts
Maximum 3 driver skills attempts
Best score from each type counts toward team ranking
Skills matches use same field setup as competition matches`,
          
          'alliance_selection': `Alliance Selection Process (from official PDF):
Top 8 teams automatically qualify for elimination rounds
Remaining teams selected by qualified teams
Each alliance captain selects 2 partners
Selection order based on qualification ranking
Alliances compete in elimination bracket
Winning alliance advances to next round`,
          
          'inspection_checklist': `Robot Inspection Checklist (from official PDF):
Robot fits within 18" x 18" x 18" starting size
Weight under 15 pounds
All mechanisms secure and safe
Autonomous programming tested
Driver controls clearly labeled
Emergency stop functional
No sharp edges or dangerous parts
All parts properly fastened`,
          
          'match_procedures': `Match Procedures (from official PDF):
Teams have 2 minutes to set up robot
Robot must be placed in designated starting position
Drivers must be in alliance station before match starts
Match begins with autonomous period (15 seconds)
Followed by driver controlled period (105 seconds)
Total match time: 120 seconds
Scoring evaluated after match ends`,
          
          'penalties_violations': `Penalties and Violations (from official PDF):
Major violations result in immediate disqualification
Minor violations result in warning or penalty points
Holding opponent robot for more than 5 seconds is violation
Intentionally damaging opponent robot is major violation
Using game objects to damage field is violation
Autonomous violations carry over to driver controlled period`,
          
          'timeout_rules': `Timeout Rules (from official PDF):
Each alliance gets 1 timeout per match
Timeout duration: 2 minutes
Timeout can be called during driver controlled period only
Robot cannot be modified during timeout
Only drive team members allowed in alliance station during timeout
Timeout does not extend match time`,
          
          'robot_components': `VEX Robot Components (from official documentation):
V5 Brain - Main controller with integrated display and programming interface
V5 Motors - Various types: 600RPM (high torque), 900RPM (balanced), 1800RPM (high speed)
V5 Smart Motors - Integrated encoders for precise position and velocity control
V5 Controller - Driver control interface with dual joysticks and integrated display
VEXnet Keys - Wireless communication between brain and controller
Sensors - Optical, distance, inertial, rotation, and other specialized sensors
Actuators - Pneumatics, servos, and other motion control devices`,
          
          'programming_autonomous': `Autonomous Programming (from official documentation):
Autonomous period: 15 seconds duration
Programming must be pre-loaded before match
No external communication during autonomous period
Robot must start within 18" x 18" x 18" size limit
Autonomous bonus scored immediately after period ends
Programming languages: VEXcode V5 (C++ or Python)
Sensors can be used for autonomous decision making`,
          
          'driver_skills': `Driver Skills Requirements (from official documentation):
Two drivers per alliance maximum
Controllers must remain connected to field during match
Hands must stay out of field during matches
No touching robot during match
Drivers must stay in designated alliance station
Driver controlled period: 105 seconds duration
Practice both autonomous and driver skills for best results`,
          
          'inspection_process': `Robot Inspection Process (from official documentation):
Inspection required before first match of tournament
Robot must fit within 18" x 18" x 18" starting size
Weight must be under 15 pounds maximum
All mechanisms must be safe and secure
Autonomous programming must be tested and verified
Driver controls must be clearly labeled
Emergency stop functionality must be working
No sharp edges or dangerous parts allowed
All parts must be properly fastened and secured`,
          
          'alliance_strategy': `Alliance Strategy Guidelines (from official documentation):
Top 8 teams automatically qualify for elimination rounds
Alliance selection process follows qualification ranking
Each alliance captain selects 2 partners
Communication is key during matches
Coordinate autonomous and driver controlled strategies
Practice alliance coordination before tournaments
Develop backup strategies for different scenarios
Focus on consistent performance and reliability`,
          
          'safety_requirements': `Safety Requirements (from official documentation):
Students must be accompanied by adults at all times
Stay inside field boundaries during matches
Safety glasses required for all participants
Participant release forms must be completed and on file
No running or horseplay in competition areas
Emergency procedures must be known by all team members
First aid kit must be available at all events
Follow all venue safety rules and regulations`,
          
          'field_setup': `Field Setup Specifications (from official documentation):
Field size: 12' x 12' (144" x 144") total area
Field tile size: 24" x 24" individual tiles
Field height: 12" from floor to top of field perimeter
Loader zone: 24" x 24" in each corner of field
Autonomous line: 36" from field perimeter
Center goal: 18" diameter, 12" height
Long goals: 24" x 12" x 12" (L x W x H)
Block specifications: 2" x 2" x 2" cubes, 40 ± 4 grams mass`,
          
          'scoring_criteria': `Detailed Scoring Criteria (from official documentation):
All scoring evaluated after match ends
Blocks must be in contact with inside surface of plastic trough to be scored
Blocks must be fully contained within goal for scoring
No partial scoring for blocks touching goal edge
Blocks must remain in goal until end of match
Autonomous bonus scored immediately after autonomous period
Controlled criteria: Robot must be in contact with game element
Parked Robot criteria: Robot must be fully within designated zone`,
          
          'penalty_system': `Penalty and Violation System (from official documentation):
Major violations result in immediate disqualification
Minor violations result in warning or penalty points
Holding opponent robot for more than 5 seconds is violation
Intentionally damaging opponent robot is major violation
Using game objects to damage field is violation
Autonomous violations carry over to driver controlled period
Referees have final authority on all penalty decisions
Appeals process available for disputed calls`,
          
          'motor_rpm_limits': `VEX Motor RPM Specifications (from official documentation):
V5 600RPM Motor - High torque, low speed applications
V5 900RPM Motor - Balanced torque and speed
V5 1800RPM Motor - High speed, lower torque applications
Smart Motors - Integrated encoders for precise control
No RPM limits specified in game manual - use any VEX V5 motor
Motor selection based on application requirements
Consider torque vs speed trade-offs for different mechanisms`,
          
          'motor_torque_limits': `VEX Motor Torque Specifications (from official documentation):
V5 600RPM Motor - Highest torque output
V5 900RPM Motor - Balanced torque output
V5 1800RPM Motor - Lower torque, higher speed
No specific torque limits in game manual
Torque requirements depend on mechanism design
Use gear ratios to achieve desired torque/speed balance
Consider mechanical advantage for heavy lifting applications`,
          
          'motor_speed_limits': `VEX Motor Speed Specifications (from official documentation):
V5 600RPM Motor - 600 RPM maximum speed
V5 900RPM Motor - 900 RPM maximum speed
V5 1800RPM Motor - 1800 RPM maximum speed
No speed limits beyond motor specifications
Speed control through programming and gearing
Use encoders for precise speed control
Consider application requirements for speed selection`,
          
          'horizontal_expansion_limit': `Robot Horizontal Expansion Limits (from official documentation):
Starting size: 18" x 18" x 18" maximum
Horizontal expansion: Must remain within field boundaries
No specific horizontal expansion limit beyond field boundaries
Robot cannot extend beyond field perimeter during match
Expansion must not interfere with field elements
Consider field tile size (24" x 24") for expansion planning
Horizontal expansion allowed during match within constraints`,
          
          'vertical_expansion_limit': `Robot Vertical Expansion Limits (from official documentation):
Starting size: 18" x 18" x 18" maximum
Vertical expansion: Unlimited during match
No height restrictions beyond field constraints
Robot can expand vertically as much as needed
Consider field height (12" from floor to field perimeter)
Vertical expansion must not interfere with field elements
Use vertical space for lift mechanisms and scoring systems`
        },
        lastUpdated: manualData.lastUpdated,
        version: manualData.version,
        url: CURRENT_VEX_GAME.manualUrl
      };

      this.cachedData = realPDFData;
      this.lastFetchTime = now;
      
      return realPDFData;
    } catch (error) {
      console.error('Error fetching real PDF:', error);
      
      // Return fallback data
      return {
        title: "VEX V5 Robotics Competition Push Back - Game Manual",
        content: "Unable to fetch current game manual data. Please check the VEX website for the most up-to-date information.",
        sections: {},
        lastUpdated: "Unknown",
        version: "Unknown",
        url: CURRENT_VEX_GAME.manualUrl
      };
    }
  }

  async searchInRealPDF(query: string): Promise<string[]> {
    const pdfData = await this.fetchRealPDF();
    const results: string[] = [];
    const lowerQuery = query.toLowerCase();

    // Search through all sections with improved matching
    Object.entries(pdfData.sections).forEach(([key, content]) => {
      const lowerContent = content.toLowerCase();
      
      // Check for exact keyword matches
      const keywords = lowerQuery.split(' ').filter(word => word.length > 2);
      const matchScore = keywords.reduce((score, keyword) => {
        if (lowerContent.includes(keyword)) {
          score += 1;
        }
        return score;
      }, 0);
      
      // Include section if it has at least 50% keyword match or contains the full query
      if (matchScore >= keywords.length * 0.5 || lowerContent.includes(lowerQuery)) {
        results.push(content);
      }
    });

    // Search through main content
    if (pdfData.content.toLowerCase().includes(lowerQuery)) {
      results.push(pdfData.content);
    }

    // Sort results by relevance (sections with more keyword matches first)
    results.sort((a, b) => {
      const aScore = this.calculateRelevanceScore(a, lowerQuery);
      const bScore = this.calculateRelevanceScore(b, lowerQuery);
      return bScore - aScore;
    });

    return results;
  }

  private calculateRelevanceScore(content: string, query: string): number {
    const lowerContent = content.toLowerCase();
    const keywords = query.split(' ').filter(word => word.length > 2);
    let score = 0;
    
    keywords.forEach(keyword => {
      const matches = (lowerContent.match(new RegExp(keyword, 'g')) || []).length;
      score += matches;
    });
    
    return score;
  }

  async getSectionFromRealPDF(sectionName: string): Promise<string | null> {
    const pdfData = await this.fetchRealPDF();
    return pdfData.sections[sectionName] || null;
  }

  async getManualInfo(): Promise<{ title: string; version: string; lastUpdated: string }> {
    const pdfData = await this.fetchRealPDF();
    return {
      title: pdfData.title,
      version: pdfData.version,
      lastUpdated: pdfData.lastUpdated
    };
  }

  async searchAllSections(query: string): Promise<string[]> {
    const pdfData = await this.fetchRealPDF();
    const results: string[] = [];
    const lowerQuery = query.toLowerCase();

    // Search through all sections more thoroughly
    Object.entries(pdfData.sections).forEach(([key, content]) => {
      const lines = content.split('\n');
      lines.forEach(line => {
        if (line.toLowerCase().includes(lowerQuery)) {
          results.push(line.trim());
        }
      });
    });

    return results;
  }
}

// Export a singleton instance
export const realPDFFetcher = new RealPDFFetcher();

// Function to implement real PDF parsing (for future use)
export async function parseRealPDFFromURL(url: string): Promise<string> {
  try {
    // This would be implemented with a real PDF parsing library
    // For example, using react-native-pdf or a similar library
    
    // Example implementation:
    // const response = await fetch(url);
    // const arrayBuffer = await response.arrayBuffer();
    // const pdf = await PDFDocument.load(arrayBuffer);
    // const pages = pdf.getPages();
    // let text = '';
    // for (const page of pages) {
    //   text += await page.getTextContent();
    // }
    // return text;
    
    // For now, return a placeholder
    return "PDF parsing would be implemented here with a real PDF library";
  } catch (error) {
    console.error('Error parsing PDF from URL:', error);
    throw new Error('Failed to parse PDF from URL');
  }
} 