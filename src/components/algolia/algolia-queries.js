const query = ` {
  allAirtable(
    filter: {data: {Status: {eq: "Published"}}, table: {eq: "Posts"}}
    sort: {fields: data___Date, order: DESC}
  ) {
    nodes {
      id
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

const flatten = arr =>
  arr.map(({ data, ...rest }) => ({
    ...data,
    ...rest,
  }));

const settings = {
  attributesToSnippet: [`Markdown:20`, `Excerpt:20`],
  searchableAttributes: ['Title', 'Excerpt, Markdown', 'Tags', 'Date'],
  attributesForFaceting: ['filterOnly(Tags)'],
  attributesToHighlight: ['Title', 'Excerpt', 'Tags', 'Date'],
  customRanking: ['asc(Title)', 'desc(Date)', 'asc(Excerpt)'],
};

const queries = (indexName) => {
  return [
    {
      query: query,
      transformer: ({ data }) => flatten(data.allAirtable.nodes),
      indexName: indexName,
      settings: settings,
    },
  ]
};

module.exports = queries;
