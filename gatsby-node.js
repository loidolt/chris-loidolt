const path = require('path');
const million = require('million/compiler');

exports.createPages = async ({ graphql, actions, reporter }) => {
  // Handle errors with try-catch
  try {
    // Query posts from the GraphQL server
    const posts = await getPosts(graphql, reporter);

    // Create post pages
    await createIndividualPostPages(posts, actions);
  } catch (error) {
    reporter.panicOnBuild(`Error in createPages: ${error.message}`);
  }
};

/**
 * This function queries Gatsby's GraphQL server and asks for
 * all published posts from the 'Posts' table.
 */
async function getPosts(graphql, reporter) {
  const graphqlResult = await graphql(/* GraphQL */ `
    query AllPosts {
      allAirtable(
        filter: { data: { Status: { eq: "Published" } }, table: { eq: "Posts" } }
        sort: { data: { Date: DESC } }
      ) {
        edges {
          next {
            id
            data {
              Title
              Path
            }
          }
          post: node {
            id
            data {
              Title
              Path
            }
          }
          previous {
            id
            data {
              Title
              Path
            }
          }
        }
      }
    }
  `);

  if (graphqlResult.errors) {
    reporter.panicOnBuild('Error loading posts:', graphqlResult.errors);
    return [];
  }

  return graphqlResult.data.allAirtable.edges;
}

/**
 * This function creates individual post pages for the site.
 */
const createIndividualPostPages = (posts, { createPage }) => {
  return Promise.all(
    posts.map(({ previous, post, next }) => {
      const postPath = `/projects${post.data.Path}`;

      return createPage({
        path: postPath,
        component: path.resolve(`./src/templates/project-post-template.js`),
        context: {
          id: post.id,
          previousPostId: previous ? previous.id : null,
          previousPostPath: previous ? `/projects${previous.data.Path}` : null,
          nextPostId: next ? next.id : null,
          nextPostPath: next ? `/projects${next.data.Path}` : null
        }
      });
    })
  );
};

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    plugins: [million.webpack({ mode: 'react', server: true })]
  });
};
