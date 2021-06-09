require('dotenv').config();

module.exports = {
  siteMetadata: {
    title: `Tony Le`,
    author: `Tony Le`,
    description: `A personal blog with mostly coding stuff that I learned and found interesting enough to share with the world. Also, this is a playground for me to test Gatsby's features.`,
    siteUrl: `https://www.tonyle.dev`,
    social: {
      twitter: 'n/a',
    },
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/images`,
        name: `images`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              inlineCodeMarker: `±`,
            },
          },
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Tony Le's Blog`,
        short_name: `Tony Le`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: 'black',
        display: `minimal-ui`,
        icon: `./src/images/baseline-code-24px.svg`,
      },
    },
    `gatsby-plugin-offline`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-sass`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: process.env.GOOGLE_ANALYTICS_ID,
        head: true,
      },
    },
    `gatsby-plugin-sitemap`,
  ],
};
