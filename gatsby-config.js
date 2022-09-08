const queries = require("./src/components/algolia/algolia-queries");

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

module.exports = {
  siteMetadata: {
    title: `Loidolt Design`,
    description: `I like learning and creating. I strongly believe the world needs more of that.`,
    copyrights: "Loidolt Design 2022",
    author: `Chris Loidolt`,
    siteUrl: `https://loidolt.design`,
    githubUrl: `https://github.com/loidolt`,
    donationLink: `https://www.paypal.com/donate/?hosted_button_id=5M29WMCGYLZTJ`,
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    `gatsby-plugin-robots-txt`,
    {
      resolve: "gatsby-plugin-sitemap",
      options: {
        output: "/sitemap.xml",
      },
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: "UA-77424366-1",
        head: false,
        anonymize: true,
        respectDNT: true,
        exclude: ["/preview/**", "/do-not-track/me/too/"],
        pageTransitionDelay: 0,
        defer: false,
        sampleRate: 5,
        siteSpeedSampleRate: 10,
        cookieDomain: "loidolt.design",
      },
    },
    {
      resolve: `gatsby-plugin-material-ui`,
      options: {
        stylesProvider: {
          injectFirst: true,
        },
      },
    },
    `custom-mui-theme`,
    {
      resolve: `gatsby-source-airtable`,
      options: {
        apiKey: process.env.AIRTABLE_API_KEY, // may instead specify via env, see below
        concurrency: 5, // default, see using markdown and attachments for more information
        tables: [
          {
            baseId: process.env.AIRTABLE_POSTS_BASEID,
            tableName: process.env.AIRTABLE_POSTS_TABLENAME,
            mapping: {
              Cover_Image: `fileNode`,
              Gallery: `fileNode`,
            },
          },
          {
            baseId: process.env.AIRTABLE_POSTS_BASEID,
            tableName: process.env.AIRTABLE_WEBSITES_TABLENAME,
            mapping: {
              Image: `fileNode`
            },
          },
          {
            baseId: process.env.AIRTABLE_POSTS_BASEID,
            tableName: process.env.AIRTABLE_SERVICES_TABLENAME,
            mapping: {
              Image: `fileNode`
            },
          },
          {
            baseId: process.env.AIRTABLE_POSTS_BASEID,
            tableName: process.env.AIRTABLE_QUALIFICATIONS_TABLENAME,
          },
        ],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/src/pages`,
      },
    },
    `gatsby-plugin-image`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-plugin-sharp`,
      options: {
        stripMetadata: true,
        defaultQuality: 80,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: "gatsby-remark-embed-video",
            options: {
              related: false,
              noIframeBorder: true,
            },
          },
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 800,
              quality: 100,
            },
          },
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              classPrefix: "language-",
              inlineCodeMarker: null,
              aliases: {},
              showLineNumbers: false,
              noInlineHighlight: false,
            },
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-algolia`,
      options: {
        appId: process.env.GATSBY_ALGOLIA_APP_ID,
        apiKey: process.env.GATSBY_ALGOLIA_ADMIN_KEY,
        queries,
        chunkSize: 10000, // default: 1000
      },
    },
    `gatsby-plugin-webpack-bundle-analyser-v2`,
    `gatsby-plugin-perf-budgets`,
  ],
};
