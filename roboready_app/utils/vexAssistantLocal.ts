// vexAssistantLocal.ts
// A lightweight on-device replacement for the Python Flask server.
// Uses a simple keyword-scoring retrieval engine over a static knowledge base.

export interface Passage {
  title: string;
  content: string;
  tags?: string[]; // helpful keywords for manual/game/year disambiguation
}

class LocalAssistant {
  private passages: Passage[] = [];

  constructor() {
    // build the same knowledge base that used to live in Python
    // tags are added to help choose the correct manual/season when the question mentions a game or year
    this.passages = [
      {
        title: "Tournament Structure",
        content:
          "VEX tournaments follow this structure: Qualification matches where teams compete in 4-6 matches with randomly assigned alliance partners. Teams are ranked by Win Points (2 per win, 1 per tie), Autonomous Win Points (AWP), and Strength of Schedule (SOS). Top teams then select alliance partners for elimination rounds consisting of quarterfinals, semifinals, and finals played in best-of-3 format.",
        tags: ["tournament", "structure", "qualifications", "alliances"]
      },
      {
        title: "High Stakes Scoring",
        content:
          "High Stakes scoring: Rings on mobile goals are worth different point values depending on goal height (lower, middle, upper). Rings on wall stakes follow the same relative point values. Rings on alliance stake can have higher values. Autonomous bonuses award extra points for scoring during the autonomous period. Robot elevation at match end can provide bonus points. Check the current game manual for exact, up-to-date scoring values.",
        tags: ["high stakes", "2024", "rings", "scoring", "game", "manual"]
      },
      {
        title: "Autonomous Programming",
        content:
          "VEX autonomous programming uses sensors for accuracy. The Inertial Sensor provides gyroscope functionality for precise turns and positioning. Vision Sensors detect colored objects like goals and game pieces. Distance Sensors measure range to objects. Optical Sensors enable line tracking and color detection. GPS Sensors (V5 only) provide field positioning. Best practices include starting simple, testing from multiple positions, using consistent units, adding timeout failsafes, and keeping code modular.",
        tags: ["autonomous", "programming", "sensors"]
      },
      {
        title: "Engineering Notebook",
        content:
          "Engineering notebooks should document the complete design process including brainstorming, sketches, CAD models, build documentation with photos, testing data and performance metrics, problem-solving approaches, strategy development, team organization, and reflections. Best practices: date every entry, write in past tense, be specific and detailed, include photos and diagrams, show decision-making process, document both failures and successes, and make it authentic rather than templated.",
        tags: ["notebook", "engineering", "documentation"]
      },
      {
        title: "Robot Building Basics",
        content:
          "VEX robot building starts with a strong drivetrain. Common options include Tank Drive (simple, reliable), X-Drive (fast, maneuverable), H-Drive (strafing ability), and Mecanum (omni-directional). Key design principles: start with strong drivetrain, keep center of gravity low, ensure proper gear ratios balancing speed vs torque, use proper spacing and support, allow maintenance access, stay under size constraints, and test iteratively.",
        tags: ["drivetrain", "build", "robot"]
      },
      {
        title: "V5 Motors and Sensors",
        content:
          "V5 Smart Motors come in 11W (high speed, standard torque) and 5.5W (high torque, lower speed) variants with built-in encoders. Motor cartridges: Red (torque), Green (speed), Blue (turbo). Available sensors: Vision Sensor (color/object detection), Inertial Sensor (rotation/acceleration), Distance Sensor (ultrasonic ranging), Optical Sensor (line tracking, color), Rotation Sensor (precise position tracking), GPS Sensor (field positioning), and Limit Switch (digital detection).",
        tags: ["motors", "sensors", "v5"]
      },
      {
        title: "Competition Awards",
        content:
          "Major VEX awards include Excellence Award (overall best team considering robot performance, notebook, and interview), Tournament Champions (elimination bracket winners), Design Award (best engineering process with notebook emphasis), Judges Award (exemplary team qualities), Innovate Award (creative/innovative design), and Amaze Award (best driver skills). Judging criteria emphasize engineering notebook quality, robot design innovation, programming complexity, team interview, match performance, and teamwork.",
        tags: ["awards", "competition"]
      },
      {
        title: "Skills Challenge",
        content:
          "VEX Skills Challenges consist of two parts: Driver Skills (1 minute of manual control) and Autonomous Skills (1 minute of autonomous operation). Combined scores rank teams globally. Skills challenges are separate from regular matches and provide opportunities to showcase robot capabilities in controlled conditions. High skills scores can earn tournament seeding advantages and qualification for championship events.",
        tags: ["skills", "driver skills", "autonomous skills"]
      },
      {
        title: "Alliance Selection",
        content:
          "Alliance selection occurs after qualification matches. The top 8-16 teams (depending on tournament size) become alliance captains based on qualification ranking. Starting with the #1 seed, captains take turns selecting alliance partners from remaining teams. Selected teams can accept or decline. If declined, the captain makes another selection. This continues until all alliances are formed for elimination rounds.",
        tags: ["alliance", "selection"]
      },
      {
        title: "Programming Platforms",
        content:
          "VEX robots can be programmed using several platforms: VEXcode V5/IQ offers blocks or Python/C++ and is beginner-friendly with intuitive interface. PROS provides advanced C/C++ programming for experienced programmers with full control. RobotC is a legacy C-based platform for older systems. Python is also available through VEXcode for text-based programming with modern syntax.",
        tags: ["programming", "vexcode", "pros", "robotc"]
      },
      {
        title: "VEX IQ Competition",
        content:
          "VEX IQ is designed for elementary and middle school students. Teams build robots with VEX IQ components and compete in game-based competitions. The VEX IQ Robotics Competition features 8-robot alliances and uses a modular scoring system. Key differences from V5: larger, simpler parts, intuitive building system, block-based programming, and age-appropriate complexity.",
        tags: ["iq", "vex iq", "elementary"]
      },
      {
        title: "Driver Skills Practice",
        content:
          "Driver Skills are the manual control portion of competition. Best practices: practice field awareness by knowing where alliance members are, develop smooth controller inputs for precise movements, practice picking up and scoring game pieces under pressure, learn optimal routes across the field, communicate with your team, and practice consistently to build muscle memory.",
        tags: ["driver skills", "practice"]
      },
      {
        title: "Gear Ratios and Speed",
        content:
          "VEX motor gear ratios affect robot speed and torque. Common ratios: 1:1 (600 RPM, high speed), 3:5 (360 RPM), 1:2 (300 RPM), 1:3 (200 RPM), or lower for high torque. Speed ratio = output RPM / motor RPM. Torque increases as RPM decreases. Choose based on game requirements: fast drivetrains use 1:1 to 3:5, shooters need high torque with lower ratios.",
        tags: ["gear ratios", "speed"]
      },
      {
        title: "Common Robot Failures",
        content:
          "Avoid these common failures: weak drivetrain that stalls under load, poor wheel traction causing slipping, inefficient intake design, overengineering subsystems making them slow or heavy, poor cable management causing disconnections, insufficient bracing causing deformation, not testing under game conditions, and forgetting to check weight and size limits.",
        tags: ["failures", "troubleshooting"]
      },
      {
        title: "VEX Robotics Rules Compliance",
        content:
          "All VEX robots must comply with official rules including size constraints (not exceeding maximum dimensions), weight limits (typically 12-16 lbs depending on competition), legal parts (only official VEX components), controlled autonomous mode (no human control), and match conduct rules. Violations result in disqualification. Always check the current game manual for specific rules.",
        tags: ["rules", "compliance"]
      },
      {
        title: "Push Back Game Overview",
        content:
          "Push Back is the 2025-2026 VEX V5 Robotics Competition game. Two alliances (red and blue), each with two teams and one robot per team, compete on a 12ft x 12ft field. The objective is to score points by placing blocks (18-sided hollow plastic objects) into goals and parking robots. The game emphasizes dynamic, offensive gameplay where teams actively manipulate blocks to control goals around the field. 88 total blocks (44 blue, 44 red) are used.",
        tags: ["push back", "2025", "2026", "game"]
      },
      {
        title: "Push Back Field Layout",
        content:
          "The Push Back field is 12ft x 12ft foam tiles divided by an autonomous line. Key elements: 2 Long Goals (48.8 inches), 2 Center Goals (Upper/Lower, 22.6 inches each), 4 Loaders (2 per alliance, 21.34 inches tall, start with 6 blocks each), 2 Park Zones (18.87\" x 16.86\" each). Loaders are attached to field perimeter adjacent to alliance stations. All goals have defined control zones marked by white tape lines.",
        tags: ["push back", "field layout"]
      },
      {
        title: "Push Back Autonomous Scoring",
        content:
          "Push Back autonomous period is 15 seconds. Teams score: Each block in goal = 3 points, Long goal control zone = 10 points, Center goal upper control = 8 points, Center goal lower control = 6 points, Autonomous bonus = 10 points (to highest-scoring alliance). Autonomous Win Point awarded for: at least 7 blocks scored, at least 3 different goals contain blocks, at least 3 blocks removed from loaders, neither robot in park zone.",
        tags: ["push back", "scoring", "autonomous"]
      },
      {
        title: "Push Back Driver Control Scoring",
        content:
          "Push Back driver control period is 1:45 (105 seconds). Teams continue scoring: Each block in goal = 3 points, Long goal control = 10 points, Center goal upper = 8 points, Center goal lower = 6 points, 1 parked robot = 8 points, 2 parked robots = 30 points. Blocks are scored when in contact with inside surfaces of goal plastic, not touching same-color robot, and not touching floor. Control zone controlled by majority block color.",
        tags: ["push back", "scoring", "driver control"]
      },
      {
        title: "Push Back Goal Control Strategy",
        content:
          "Push Back emphasizes controlling goals through block placement. A control zone is controlled when majority of scored blocks in that zone are the same alliance color. For long goals, blocks must be fully within tape lines. For center goals, entire goal is control zone. Teams score both for individual blocks (3 pts each) and for controlling entire zones (8-10 pts). Strategic block placement in multiple goals is key to high scores.",
        tags: ["push back", "strategy", "control"]
      },
      {
        title: "Push Back Robot Mechanics",
        content:
          "Push Back robots must fit within 18x18x18 inches at start, can expand to max 22x22 inches horizontally and 22 inches tall. Robots can carry/push unlimited blocks but must maintain size limits. Design focuses on block manipulation (pushing or lifting), mobility for field navigation, and parking mechanisms. Robots start with one preload block (must contact robot of same color). No requirements for specific mechanism types - pushing or lifting both viable.",
        tags: ["push back", "robot mechanics"]
      },
      {
        title: "Push Back Offensive vs Defensive Play",
        content:
          "Push Back emphasizes offensive play where teams actively score blocks. Defensive strategies are allowed but limited: Holding a robot for more than 3-count = violation. Goalkeeping (reaching into goal without moving blocks) not permitted during driver control. Purely destructive strategies prohibited. Dynamic, back-and-forth gameplay encouraged. Teams must provide open lanes for scoring. Offensive teams receive benefit of doubt in judgment calls.",
        tags: ["push back", "strategy"]
      },
      {
        title: "Push Back Match Loads and Loaders",
        content:
          "Push Back has 24 match load blocks (12 per alliance) loaded through loaders during driver control. Drive team members can add one block at a time to loaders. Can only load if fewer than 5 blocks in loader's orange section. Blocks bounce out through bottom of loader during match load = not a violation. Robots remove blocks from loaders through bottom opening. Each alliance has 2 loaders adjacent to their alliance station.",
        tags: ["push back", "match loads"]
      }
    ];
  }

  /**
   * Determine if a question is related to VEX robotics.
   * Expanded to include year terms, game names, and scoring words.
   */
  isRoboticsQuestion(question: string): boolean {
    const roboticsKeywords = [
      'vex',
      'robot',
      'competition',
      'tournament',
      'programming',
      'autonomous',
      'sensor',
      'motor',
      'build',
      'design',
      'scoring',
      'match',
      'alliance',
      'team',
      'code',
      'controller',
      'brain',
      'game',
      'push back',
      'high stakes',
      '2025',
      '2026',
      '2024',
      'score',
      'rules'
    ];

    const lower = question.toLowerCase();
    return roboticsKeywords.some(k => lower.includes(k));
  }

  /**
   * Search the knowledge base using a crude keyword overlap score.
   * Returns passages sorted by score (higher first).
   */
  search(question: string): Passage[] {
    const q = question.toLowerCase();
    const words = q.split(/[^a-z0-9]+/).filter(Boolean);

    const scored = this.passages
      .map(p => {
        let score = 0;
        const text = (p.title + ' ' + p.content).toLowerCase();

        for (const w of words) {
          if (text.includes(w)) score += 1;
        }

        if (p.tags) {
          for (const tag of p.tags) {
            if (q.includes(tag.toLowerCase())) score += 5;
          }
        }

        // strongly prefer passages tagged for a specific season when the question mentions a year
        if (q.match(/202[3-9]/)) {
          if (p.tags && p.tags.some(t => /202[3-9]/.test(t))) {
            score += 10;
          }
        }

        return { passage: p, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.passage);

    return scored;
  }

  /**
   * Get a response for a question.
   * If no relevant passage is found, fall back to a generic reply.
   */
  answer(question: string): string {
    if (!this.isRoboticsQuestion(question)) {
      return "I'm designed to help with VEX Robotics questions! Ask me about competitions, building, programming, rules, or strategies.";
    }

    const results = this.search(question);
    if (results.length === 0) {
      return "I don't have enough information to answer that question. Please ask about VEX Robotics topics like competitions, building, or programming.";
    }

    // combine the top result(s) into a single answer string
    // for simplicity we just return the first passage's content, maybe add a short prefix
    return results[0].content;
  }
}

// export a singleton instance to keep performance reasonable
const localAssistant = new LocalAssistant();
export default localAssistant;
