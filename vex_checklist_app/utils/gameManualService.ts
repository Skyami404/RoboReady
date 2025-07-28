export interface GameManualData {
  title: string;
  content: string;
  url: string;
  lastUpdated: string;
  version: string;
  sections: {
    [key: string]: string;
  };
}

export interface VEXGameInfo {
  name: string;
  year: string;
  manualUrl: string;
  description: string;
}

// Current VEX game information
export const CURRENT_VEX_GAME: VEXGameInfo = {
  name: "Push Back",
  year: "2025-2026",
  manualUrl: "https://content.vexrobotics.com/docs/25-26/v5rc-push-back/docs/Push-Back-1.0.pdf",
  description: "VEX V5 Robotics Competition Push Back"
};

// Cached game manual data
let cachedManualData: GameManualData | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const fetchGameManualData = async (): Promise<GameManualData> => {
  const now = Date.now();
  
  // Return cached data if it's still fresh
  if (cachedManualData && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedManualData;
  }

  try {
    // In a real implementation, this would fetch from the VEX website
    // For now, we'll use the data from the search results
    const manualData: GameManualData = {
      title: "VEX V5 Robotics Competition Push Back - Game Manual",
      content: `2025-2026 VEX V5 Robotics Competition Push Back Game Manual

Key Information:
- Version 1.0 (June 26, 2025)
- Game: Push Back
- Competition: V5RC

Scoring Rules:
- All scoring evaluated after match ends
- Blocks must be in contact with inside surface of plastic trough to be scored
- Autonomous bonus scored immediately after autonomous period

Safety Rules:
- Students must be accompanied by adults
- Stay inside the field
- Wear safety glasses
- Completed participant release forms required

Field Specifications:
- Field dimensions and specifications available
- Block mass: 40 ± 4 grams
- Various goals and zones with specific dimensions

Tournament Rules:
- Head referees have final authority
- Standard tournament procedures apply
- Robot skills challenges available`,
      url: CURRENT_VEX_GAME.manualUrl,
      lastUpdated: "June 26, 2025",
      version: "1.0",
              sections: {
          scoring: `Scoring Rules:
All scoring is evaluated after the match ends
Blocks must be in contact with the inside surface of plastic troughs to be scored
Autonomous bonus is scored immediately after the autonomous period
Scoring statuses are evaluated after the match ends
Controlled criteria apply to certain game elements
Parked Robot criteria for end-game scoring`,

          safety: `Safety Rules:
Students must be accompanied by adults
Stay inside the field boundaries
Safety glasses required at all times
Participant release forms must be completed
Be safe out there - safety is the top priority
Each student team member must have completed forms on file`,

          field: `Field Specifications:
Block mass: 40 ± 4 grams
Various goals and zones with specific dimensions
Field modifications permitted with threadlocker and non-VEX white electrical tape
Field components may vary slightly from event to event
Teams should design mechanisms to accommodate field variances
Minor field repairs are permissible if they don't affect gameplay`,

          tournament: `Tournament Rules:
Head referees have final authority on all gameplay and robot decisions
Standard tournament procedures and formats apply
Robot skills challenges available for additional scoring
Event partners have flexibility in measuring robot starting sizes
Tournament structure follows established VEX competition guidelines
Alliance coordination and communication are essential`,

          robot: `Robot Rules:
Robots must meet inspection requirements
Size constraints apply (check current game manual)
Mechanisms must be robust and reliable
Autonomous programming must follow specific guidelines
Driver-controlled mechanisms must be safe and effective
Robot modifications must comply with competition rules`,

          general: `General Game Rules:
Only drive team members in alliance station
Robots must be ready to play when on field
Hands out of the field during matches
Controllers must stay connected to field
Autonomous means no human intervention
All rules apply during autonomous period
Offensive robots get benefit of the doubt
No holding for more than 5-count
Use game objects to play the game`
        }
    };

    cachedManualData = manualData;
    lastFetchTime = now;
    
    return manualData;
  } catch (error) {
    console.error('Failed to fetch game manual data:', error);
    
    // Return fallback data if fetch fails
    return {
      title: "VEX V5 Robotics Competition Push Back - Game Manual",
      content: "Unable to fetch current game manual data. Please check the VEX website for the most up-to-date information.",
      url: CURRENT_VEX_GAME.manualUrl,
      lastUpdated: "Unknown",
      version: "Unknown",
      sections: {}
    };
  }
};

export const searchGameManual = async (query: string): Promise<string[]> => {
  const manualData = await fetchGameManualData();
  const results: string[] = [];
  const lowerQuery = query.toLowerCase();

  // Search through sections
  Object.entries(manualData.sections).forEach(([section, content]) => {
    if (content.toLowerCase().includes(lowerQuery)) {
      results.push(content);
    }
  });

  // Search through main content
  if (manualData.content.toLowerCase().includes(lowerQuery)) {
    results.push(manualData.content);
  }

  return results;
};

export const getGameManualSection = async (section: string): Promise<string | null> => {
  const manualData = await fetchGameManualData();
  return manualData.sections[section] || null;
};

export const getCurrentGameInfo = (): VEXGameInfo => {
  return CURRENT_VEX_GAME;
}; 