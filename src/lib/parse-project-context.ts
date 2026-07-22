// ── README PARSER ──
// Extracts structured context from a project README for AI prompt generation.
// Pure utility - regex/keyword matching, no API calls.

export interface ProjectContextParsed {
  techStack: string[];
  framework: string | null;
  language: string | null;
  stateManagement: string | null;
  styling: string | null;
  database: string | null;
  testing: string | null;
  projectDescription: string | null;
  keyDirectories: string[];
}

// ── Tech lookup table ──

interface TechEntry {
  pattern: RegExp;
  name: string;
  category: "framework" | "language" | "state" | "styling" | "database" | "testing" | "library";
}

const TECH_TABLE: TechEntry[] = [
  // Frameworks
  { pattern: /\bNext\.?js\b/i, name: "Next.js", category: "framework" },
  { pattern: /\bNuxt\.?js?\b/i, name: "Nuxt", category: "framework" },
  { pattern: /\bSvelteKit\b/i, name: "SvelteKit", category: "framework" },
  { pattern: /\bRemix\b/i, name: "Remix", category: "framework" },
  { pattern: /\bAstro\b/i, name: "Astro", category: "framework" },
  { pattern: /\bVite\b/, name: "Vite", category: "framework" },
  { pattern: /\bWebpack\b/i, name: "Webpack", category: "framework" },
  { pattern: /\bCreate React App\b|CRA/i, name: "Create React App", category: "framework" },
  { pattern: /\bExpress\b/, name: "Express", category: "framework" },
  { pattern: /\bFastify\b/i, name: "Fastify", category: "framework" },
  { pattern: /\bDjango\b/, name: "Django", category: "framework" },
  { pattern: /\bFlask\b/, name: "Flask", category: "framework" },
  { pattern: /\bRails\b/, name: "Rails", category: "framework" },
  { pattern: /\bLaravel\b/i, name: "Laravel", category: "framework" },
  { pattern: /\bSpring Boot\b/i, name: "Spring Boot", category: "framework" },

  // Languages
  { pattern: /\bTypeScript\b/i, name: "TypeScript", category: "language" },
  { pattern: /\bPython\b/i, name: "Python", category: "language" },
  { pattern: /\bRust\b/, name: "Rust", category: "language" },
  { pattern: /\bGo(?:lang)?\b/, name: "Go", category: "language" },

  // UI Libraries
  { pattern: /\bReact\b/, name: "React", category: "library" },
  { pattern: /\bVue\.?js?\b/i, name: "Vue", category: "library" },
  { pattern: /\bSvelte\b/, name: "Svelte", category: "library" },
  { pattern: /\bAngular\b/, name: "Angular", category: "library" },
  { pattern: /\bSolid\.?js?\b/i, name: "SolidJS", category: "library" },

  // State management
  { pattern: /\bZustand\b/i, name: "Zustand", category: "state" },
  { pattern: /\bRedux\b/i, name: "Redux", category: "state" },
  { pattern: /\bMobX\b/i, name: "MobX", category: "state" },
  { pattern: /\bJotai\b/i, name: "Jotai", category: "state" },
  { pattern: /\bRecoil\b/i, name: "Recoil", category: "state" },
  { pattern: /\bPinia\b/i, name: "Pinia", category: "state" },
  { pattern: /\bVuex\b/i, name: "Vuex", category: "state" },
  { pattern: /\bXState\b/i, name: "XState", category: "state" },

  // Styling
  { pattern: /\bTailwind\b/i, name: "Tailwind CSS", category: "styling" },
  { pattern: /\bstyled-components\b/i, name: "styled-components", category: "styling" },
  { pattern: /\bEmotion\b/i, name: "Emotion", category: "styling" },
  { pattern: /\bCSS Modules?\b/i, name: "CSS Modules", category: "styling" },
  { pattern: /\bSass\b|\bSCSS\b/i, name: "Sass", category: "styling" },
  { pattern: /\bChakra\s?UI\b/i, name: "Chakra UI", category: "styling" },
  { pattern: /\bMUI\b|\bMaterial[- ]UI\b/i, name: "Material UI", category: "styling" },
  { pattern: /\bshadcn\b/i, name: "shadcn/ui", category: "styling" },

  // Databases
  { pattern: /\bSupabase\b/i, name: "Supabase", category: "database" },
  { pattern: /\bFirebase\b/i, name: "Firebase", category: "database" },
  { pattern: /\bPrisma\b/i, name: "Prisma", category: "database" },
  { pattern: /\bDrizzle\b/i, name: "Drizzle", category: "database" },
  { pattern: /\bPostgreSQL\b|\bPostgres\b/i, name: "PostgreSQL", category: "database" },
  { pattern: /\bMongoDB\b/i, name: "MongoDB", category: "database" },
  { pattern: /\bDexie\b/i, name: "Dexie (IndexedDB)", category: "database" },
  { pattern: /\bSQLite\b/i, name: "SQLite", category: "database" },

  // Testing
  { pattern: /\bVitest\b/i, name: "Vitest", category: "testing" },
  { pattern: /\bJest\b/, name: "Jest", category: "testing" },
  { pattern: /\bPlaywright\b/i, name: "Playwright", category: "testing" },
  { pattern: /\bCypress\b/i, name: "Cypress", category: "testing" },
  { pattern: /\bTesting Library\b/i, name: "Testing Library", category: "testing" },

  // Other notable libraries
  { pattern: /\bFresco\b/i, name: "Fresco", category: "library" },
  { pattern: /\bFramer Motion\b/i, name: "Framer Motion", category: "library" },
  { pattern: /\bThree\.?js\b/i, name: "Three.js", category: "library" },
  { pattern: /\bD3\.?js?\b/i, name: "D3", category: "library" },
  { pattern: /\btRPC\b/, name: "tRPC", category: "library" },
  { pattern: /\bGraphQL\b/i, name: "GraphQL", category: "library" },
  { pattern: /\bStripe\b/i, name: "Stripe", category: "library" },
];

// ── Directory patterns ──

const DIR_PATTERNS = [
  /(?:^|\s)(src\/[\w-]+\/?)/gm,
  /(?:^|\s)(app\/[\w-]+\/?)/gm,
  /(?:^|\s)(pages\/[\w-]+\/?)/gm,
  /(?:^|\s)(lib\/[\w-]+\/?)/gm,
  /(?:^|\s)(components\/[\w-]+\/?)/gm,
  /[├└│]\s*([\w-]+\/)/gm,
];

// ── Parser ──

export function parseProjectContext(raw: string): ProjectContextParsed {
  const result: ProjectContextParsed = {
    techStack: [],
    framework: null,
    language: null,
    stateManagement: null,
    styling: null,
    database: null,
    testing: null,
    projectDescription: null,
    keyDirectories: [],
  };

  if (!raw?.trim()) return result;

  // Detect technologies
  const seen = new Set<string>();
  for (const entry of TECH_TABLE) {
    if (entry.pattern.test(raw) && !seen.has(entry.name)) {
      seen.add(entry.name);
      result.techStack.push(entry.name);

      switch (entry.category) {
        case "framework":
          if (!result.framework) result.framework = entry.name;
          break;
        case "language":
          if (!result.language) result.language = entry.name;
          break;
        case "state":
          if (!result.stateManagement) result.stateManagement = entry.name;
          break;
        case "styling":
          if (!result.styling) result.styling = entry.name;
          break;
        case "database":
          if (!result.database) result.database = entry.name;
          break;
        case "testing":
          if (!result.testing) result.testing = entry.name;
          break;
      }
    }
  }

  // Extract project description - first non-heading, non-empty paragraph
  const lines = raw.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#")) continue;
    if (trimmed.startsWith("-") || trimmed.startsWith("*")) continue;
    if (trimmed.startsWith("```")) continue;
    if (trimmed.startsWith("[") || trimmed.startsWith("!")) continue; // badges/images
    if (trimmed.startsWith("|")) continue; // tables
    if (trimmed.length < 20) continue; // too short to be meaningful
    result.projectDescription = trimmed.length > 200 ? trimmed.slice(0, 200) + "..." : trimmed;
    break;
  }

  // Extract directory paths
  const dirSet = new Set<string>();
  for (const pattern of DIR_PATTERNS) {
    // Reset regex state
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(raw)) !== null) {
      const dir = match[1].trim();
      if (dir.length > 2 && dir.length < 50) {
        dirSet.add(dir.endsWith("/") ? dir : dir + "/");
      }
    }
  }
  result.keyDirectories = Array.from(dirSet).slice(0, 10);

  return result;
}
