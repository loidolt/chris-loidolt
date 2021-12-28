const pageQuery = ` {
  posts: allAirtable(
    filter: {data: {Status: {eq: "Published"}}, table: {eq: "Posts"}}
    sort: {fields: data___Date, order: DESC}
  ) {
    edges {
      node {
        data {
          Tags
          Title
          Path
          Excerpt
          Markdown
          Date(formatString: "DD MMMM YYYY")
          Cover_Image {
            localFiles {
              publicURL
              name
            }
          }
        }
        id
      }
    }
  }
}
`;
const flatten = (arr) =>
  arr.map(({ node: { data, ...rest } }) => ({
    ...data,
    ...rest,
  }));
const settings = {
  attributesToSnippet: [`Markdown:20`, `Excerpt:20`],
  searchableAttributes: ["Title", "Excerpt, Markdown", "Tags", "Date"],
  attributesForFaceting: ["filterOnly(Tags)"],
  attributesToHighlight: ["Title", "Excerpt", "Tags", "Date"],
  customRanking: ["asc(Title)", "desc(Date)", "asc(Excerpt)"],
};
const queries = [
  {
    query: pageQuery,
    transformer: ({ data }) => flatten(data.posts.edges),
    indexName: `posts`,
    settings,
  },
];
module.exports = queries;
