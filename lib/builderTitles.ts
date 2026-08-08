import type { BuilderTitleSet } from "@/types";

interface TitleCategory {
  id: string;
  keywords: readonly string[];
  titles: readonly string[];
}

const TITLE_CATEGORIES: readonly TitleCategory[] = [
  {
    id: "fullstack",
    keywords: ["full stack", "fullstack", "web developer", "mern", "mean stack"],
    titles: [
      "The Stack Shapeshifter",
      "End-to-End Enchanter",
      "Systems Builder",
      "The Product Polymath",
      "Ship-It Generalist",
    ],
  },
  {
    id: "frontend",
    keywords: [
      "frontend",
      "front end",
      "react",
      "next.js",
      "nextjs",
      "vue",
      "angular",
      "ui engineer",
    ],
    titles: [
      "Pixel Alchemist",
      "Frontend Sorcerer",
      "Interface Inventor",
      "The Browser Bard",
      "CSS Cartographer",
    ],
  },
  {
    id: "backend",
    keywords: [
      "backend",
      "back end",
      "api",
      "server",
      "node",
      "java",
      "golang",
      "rust",
      "python developer",
    ],
    titles: [
      "API Whisperer",
      "Runtime Wrangler",
      "The Logic Locksmith",
      "Systems Builder",
      "Database Diplomat",
    ],
  },
  {
    id: "ai",
    keywords: [
      "artificial intelligence",
      "machine learning",
      "ai/ml",
      "ai ml",
      "llm",
      "genai",
      "generative ai",
      "prompt",
      "agent",
      " ai ",
    ],
    titles: [
      "The Agent Architect",
      "Prompt Mechanic",
      "Model Tinkerer",
      "Neural Navigator",
      "The Context Crafter",
    ],
  },
  {
    id: "design",
    keywords: [
      "designer",
      "design",
      "ux",
      "visual",
      "brand",
      "illustrator",
      "creative",
    ],
    titles: [
      "Experience Alchemist",
      "The Vibe Engineer",
      "Flow Sculptor",
      "Pixel Storyteller",
      "Interface Inventor",
    ],
  },
  {
    id: "product",
    keywords: [
      "product",
      "founder",
      "entrepreneur",
      "builder",
      "growth",
      "strategy",
    ],
    titles: [
      "The Product Pathfinder",
      "Roadmap Renegade",
      "Idea-to-Impact Builder",
      "The Launch Conductor",
      "Momentum Maker",
    ],
  },
  {
    id: "mobile",
    keywords: ["mobile", "ios", "android", "flutter", "react native", "swift", "kotlin"],
    titles: [
      "Pocket-Sized Pioneer",
      "App Store Alchemist",
      "The Tap Architect",
      "Mobile Maverick",
      "Gesture Wizard",
    ],
  },
  {
    id: "devops",
    keywords: [
      "devops",
      "platform",
      "infrastructure",
      "cloud",
      "sre",
      "kubernetes",
      "docker",
    ],
    titles: [
      "Cloud Conductor",
      "Pipeline Pilot",
      "Uptime Alchemist",
      "The Infra Inventor",
      "Deploy Whisperer",
    ],
  },
  {
    id: "data",
    keywords: ["data", "analytics", "database", "sql", "bi engineer", "scientist"],
    titles: [
      "Data Cartographer",
      "Signal Seeker",
      "Query Conjurer",
      "The Insight Engine",
      "Pattern Prospector",
    ],
  },
  {
    id: "security",
    keywords: ["security", "cyber", "infosec", "pentest", "ethical hacker"],
    titles: [
      "The Threat Tamer",
      "Cipher Sentinel",
      "Bug Bounty Bard",
      "Security Shapeshifter",
      "Firewall Whisperer",
    ],
  },
  {
    id: "web3",
    keywords: ["web3", "blockchain", "solidity", "crypto", "smart contract"],
    titles: [
      "Chain Composer",
      "Protocol Pioneer",
      "The Ledger Legend",
      "Contract Conjurer",
      "Onchain Architect",
    ],
  },
];

const GENERAL_TITLES = [
  "Systems Builder",
  "Prototype Pirate",
  "The Shipping Machine",
  "Build Mode Boss",
  "Idea Alchemist",
  "Weekend Worldbuilder",
] as const;

function normalizeRole(role: string): string {
  return ` ${role
    .normalize("NFKD")
    .toLocaleLowerCase("en-US")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9+#./]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

function stableHash(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function categoryMatches(category: TitleCategory, normalizedRole: string): boolean {
  return category.keywords.some((keyword) => {
    const normalizedKeyword = keyword.startsWith(" ")
      ? keyword
      : ` ${keyword.toLocaleLowerCase("en-US")} `;

    return normalizedRole.includes(normalizedKeyword);
  });
}

/**
 * Returns three local, deterministic title suggestions derived from role keywords.
 * No randomness or network access is used, so the same role always produces the
 * same ordered set.
 */
export function generateBuilderTitles(role: string): BuilderTitleSet {
  const normalizedRole = normalizeRole(role);
  const matchedCategories = TITLE_CATEGORIES.filter((category) =>
    categoryMatches(category, normalizedRole),
  );
  const categories = matchedCategories.length > 0 ? matchedCategories : [];
  const seed = stableHash(normalizedRole);
  const suggestions: string[] = [];

  for (let pass = 0; pass < 3 && suggestions.length < 3; pass += 1) {
    for (const [categoryIndex, category] of categories.entries()) {
      const titleIndex = (seed + pass + categoryIndex * 3) % category.titles.length;
      const title = category.titles[titleIndex];

      if (!suggestions.includes(title)) {
        suggestions.push(title);
      }

      if (suggestions.length === 3) {
        break;
      }
    }
  }

  for (let index = 0; suggestions.length < 3; index += 1) {
    const title = GENERAL_TITLES[(seed + index) % GENERAL_TITLES.length];

    if (!suggestions.includes(title)) {
      suggestions.push(title);
    }
  }

  return [suggestions[0], suggestions[1], suggestions[2]];
}

/** Backwards-friendly alias for components that prefer a getter-style name. */
export const getBuilderTitles = generateBuilderTitles;
