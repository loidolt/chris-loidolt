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
  },
  plugins: [
    `gatsby-plugin-gatsby-cloud`,
    'gatsby-plugin-top-layout',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-mui-emotion',
    {
      resolve: "gatsby-plugin-sitemap",
      options: {
        output: "/sitemap.xml",
      },
    },
    "gatsby-plugin-robots-txt",
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        // The property ID; the tracking code won't be generated without it
        trackingId: "UA-77424366-1",
        // Defines where to place the tracking script - `true` in the head and `false` in the body
        head: false,
        // Setting this parameter is optional
        anonymize: true,
        // Setting this parameter is also optional
        respectDNT: true,
        // Avoids sending pageview hits from custom paths
        exclude: ["/preview/**", "/do-not-track/me/too/"],
        // Delays sending pageview hits on route update (in milliseconds)
        pageTransitionDelay: 0,
        // Defers execution of google analytics script after page load
        defer: false,
        // Any additional optional fields
        sampleRate: 5,
        siteSpeedSampleRate: 10,
        cookieDomain: "loidolt.design",
      },
    },
    {
      resolve: 'gatsby-plugin-firebase',
      options: {
        features: {
          auth: false,
          database: false,
          firestore: true,
          storage: true,
          messaging: false,
          functions: true,
          performance: true,
          analytics: true,
        },
        credentials: {
          apiKey: process.env.GATSBY_FIREBASE_API_KEY,
          authDomain: process.env.GATSBY_FIREBASE_AUTH_DOMAIN,
          databaseURL: process.env.GATSBY_FIREBASE_DATABASE_URL,
          projectId: process.env.GATSBY_FIREBASE_PROJECT_ID,
          storageBucket: process.env.GATSBY_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.GATSBY_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.GATSBY_FIREBASE_APP_ID,
          measurementId: process.env.GATSBY_FIREBASE_MEASUREMENT_ID,
        },
      }
    },
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
    "gatsby-transformer-json",
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: `${__dirname}/src/data`,
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
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `loidolt-design`,
        short_name: `loidolt-design`,
        start_url: `/`,
        background_color: `#212121`,
        theme_color: `#212121`,
        display: `minimal-ui`,
        icon: `src/images/CLLightBulbBlue.png`, // This path is relative to the root of the site.
      },
    },
  ],
};
