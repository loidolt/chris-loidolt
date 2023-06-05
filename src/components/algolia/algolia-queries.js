const query = ` {
  allAirtable(
    filter: {data: {Status: {eq: "Published"}}, table: {eq: "Posts"}}
    sort: {data: {Date: DESC}}
  ) {
    nodes {
      id
      internal {
        contentDigest
        type
        owner
      }
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
            childImageSharp {
              gatsbyImageData(sizes: "width: 80, height: 80")
            }
          }
        }
      }
    }
  }
}
`;

const flatten = (arr) =>
  arr.map(({ data, ...rest }) => ({
    ...data,
    ...rest
  }));

const settings = {
  attributesToSnippet: [`Markdown:20`, `Excerpt:20`],
  searchableAttributes: ['Title', 'Excerpt, Markdown', 'Tags', 'Date'],
  attributesForFaceting: ['filterOnly(Tags)'],
  attributesToHighlight: ['Title', 'Excerpt', 'Tags', 'Date'],
  customRanking: ['asc(Title)', 'desc(Date)', 'asc(Excerpt)']
};

const queries = [
  {
    query: query,
    transformer: ({ data }) => flatten(data.allAirtable.nodes),
    indexName: `posts`,
    settings: settings
  }
];

module.exports = queries;
