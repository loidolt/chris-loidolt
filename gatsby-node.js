const { paginate } = require('gatsby-awesome-pagination');
const path = require('path');

exports.createPages = async (gatsbyUtilities) => {
  const { createPage } = gatsbyUtilities.actions;

  // Query posts from the GraphQL server
  const posts = await getPosts(gatsbyUtilities);
  //console.log(posts);

  // Create posts index with pagination
  paginate({
    createPage,
    items: posts,
    component: path.resolve(`./src/templates/project-template.js`),
    itemsPerPage: 12,
    pathPrefix: '/projects'
  });

  // Create post pages
  await createIndividualPostPages({ posts, gatsbyUtilities });
};

/**
 * This function creates all the individual post pages in this site
 */
const createIndividualPostPages = async ({ posts, gatsbyUtilities }) =>
  Promise.all(
    posts.map(({ previous, post, next }) =>
      // createPage is an action passed to createPages
      // See https://www.gatsbyjs.com/docs/actions#createPage for more info
      gatsbyUtilities.actions.createPage({
        path: '/projects' + post.data.Path,
        component: path.resolve(`./src/templates/project-post-template.js`),

        // `context` is available in the template as a prop and
        // as a variable in GraphQL.
        context: {
          id: post.id,
          previousPostId: previous ? previous.id : null,
          previousPostPath: previous ? previous.data.Path : null,
          previousPostTitle: previous ? previous.data.Title : null,
          nextPostId: next ? next.id : null,
          nextPostPath: next ? next.data.Path : null,
          nextPostTitle: next ? next.data.Title : null
        }
      })
    )
  );

/**
 * This function queries Gatsby's GraphQL server and asks for
 * All Airtable posts. If there are any GraphQL error it throws an error
 * Otherwise it will return the posts
 *
 * We're passing in the utilities we got from createPages.
 * So see https://www.gatsbyjs.com/docs/node-apis/#createPages for more info!
 */
async function getPosts({ graphql, reporter }) {
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
            data {
              Tags
              Title
              Path
            }
            id
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
    reporter.panicOnBuild(`There was an error loading your posts`, graphqlResult.errors);
    return;
  }

  return graphqlResult.data.allAirtable.edges;
}
