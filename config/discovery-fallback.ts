// Fallback discovery configuration that works without topics
export const discoveryFallbackConfig = {
  sources: {
    github: {
      owner: process.env.GITHUB_OWNER!,
      includeOrgs: [],
    },
  },
  rules: {
    include: {
      // Accept all repos when no topics are specified
      all: true,
      // Or use specific repo names
      repos: [],
    },
    exclude: {
      // Common patterns to exclude
      patterns: [
        /^\./, // Hidden repos (starting with .)
        /^_/, // Private repos (starting with _)
        /test$/i, // Test repos
        /demo$/i, // Demo repos
        /tmp$/i, // Temporary repos
        /old$/i, // Old repos
      ],
      // Specific repos to exclude
      repos: [
        'dotfiles',
        '.github',
        'profile',
      ],
    },
  },
  // Auto-categorize based on repo characteristics
  autoCategorize: {
    byName: {
      '3d-printing': /3d|print/i,
      'electronics': /arduino|sensor|controller|pump/i,
      'woodworking': /cabinet|wood|furniture/i,
      'home-automation': /automation|smart|iot/i,
      'web-development': /website|web|api|frontend|backend/i,
    },
    byLanguage: {
      'software': ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#'],
      'hardware': ['C', 'C++', 'Arduino'],
      'web': ['HTML', 'CSS', 'JavaScript', 'TypeScript'],
    },
  },
};