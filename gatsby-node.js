const { paginate } = require("gatsby-awesome-pagination");
const path = require("path");
const { toKebabCase } = require("./src/helpers");
const util = require("util");
const child_process = require("child_process");
const exec = util.promisify(child_process.exec);

exports.createPages = async (gatsbyUtilities) => {
  const { createPage } = gatsbyUtilities.actions;

  // Query posts from the GraphQL server
  const posts = await getPosts(gatsbyUtilities);
  //console.log(posts);

  // Create posts index with pagination
  paginate({
    createPage,
    items: posts,
    component: path.resolve(`./src/templates/index-template.js`),
    itemsPerPage: 12,
    pathPrefix: "/",
  });

  // Create tag pages

  // Get all tags and filter unique falues
  let allTags = [];
  posts.map(({ post }) => {
    post.data.Tags.map((tag) => {
      //console.log(tag);
      let tagString = String(tag);
      allTags.push(tagString);
    });
  });
  //console.log(allTags);
  let tags = [...new Set(allTags)];
  //console.log(tags);

  tags.forEach((tag) => {
    const postsWithTag = posts.filter(
      ({ post }) => post.data.Tags && post.data.Tags.indexOf(tag) !== -1
    );

    paginate({
      createPage,
      items: postsWithTag,
      component: path.resolve(`./src/templates/tags-template.js`),
      itemsPerPage: 12,
      pathPrefix: `/tag/${toKebabCase(tag)}`,
      context: {
        tag,
      },
    });
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
        path: post.data.Path,
        component: path.resolve(`./src/templates/post-template.js`),

        // `context` is available in the template as a prop and
        // as a variable in GraphQL.
        context: {
          id: post.id,
          previousPostId: previous ? previous.id : null,
          previousPostPath: previous ? previous.data.Path : null,
          previousPostTitle: previous ? previous.data.Title : null,
          nextPostId: next ? next.id : null,
          nextPostPath: next ? next.data.Path : null,
          nextPostTitle: next ? next.data.Title : null,
        },
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
        filter: {
          data: { Status: { eq: "Published" } }
          table: { eq: "Posts" }
        }
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
    reporter.panicOnBuild(
      `There was an error loading your posts`,
      graphqlResult.errors
    );
    return;
  }

  return graphqlResult.data.allAirtable.edges;
}


//Netlify Functions
/* exports.onPostBuild = async (gatsbyNodeHelpers) => {
  const { reporter } = gatsbyNodeHelpers;

  const reportOut = (report) => {
    const { stderr, stdout } = report;
    if (stderr) reporter.error(stderr);
    if (stdout) reporter.info(stdout);
  };

  // NOTE: the gatsby build process automatically copies /static/functions to /public/functions
  // If you use yarn, replace "npm install" with "yarn install"
  reportOut(await exec("cd ./public/functions && npm install"));
}; */