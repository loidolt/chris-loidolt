export const discoveryConfig = {
  sources: {
    github: {
      owner: process.env.GITHUB_OWNER!,
      includeOrgs: [],
    },
  },
  rules: {
    include: {
      topics: {
        any: ['forest', 'project', 'note', 'writing', 'experiment'],
        all: [],
      },
      visibility: ['public'],
    },
    exclude: {
      topics: ['archived', 'deprecated', 'private'],
      repos: ['dotfiles', '.github'],
      patterns: [/^\./, /^_/],
    },
    categorize: {
      featured: { topics: ['featured'] },
      portfolio: { topics: ['portfolio'] },
      drafts: { topics: ['draft'] },
    },
  },
};