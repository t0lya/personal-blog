---
title: Preview in Headless Wordpress with Gatsby (WIP)
description: 'How to enable preview of posts in Headless Wordpress stack using Gatsby rehydration'
date: '2019-07-21'
---

Gatsby is an open source framework based on React that builds static pages server side, allowing lightning fast loading of web pages on browsers. In a headless stack, Wordpress serves as a data layer for pushing your content (posts, pages, menus etc.) to Gatsby, which then uses this data to build your static pages. In this post I will show you how to enable the preview of posts in the Wordpress Admin UI. The source code for the tutorial can be found [here](https://github.com/let00/headless-wordpress-preview).

### Initial Setup

If you already have a Gatsby project and a Wordpress instance set up, you can skip this section. First, we will install a Gatsby project (install [Node](https://nodejs.org/en/download/) if you haven't already). Run these commands in your terminal:

```
npm install -g gatsby-cli
gatsby new YOUR_PROJECT_NAME https://github.com/gatsbyjs/gatsby-starter-blog
```

We will use Docker to start Wordpress in a container on our local machine. Follow these [instructions](https://docs.docker.com/install/) to install Docker if you have not done so already. In the root of your Gatsby project, create a `docker-compose.yml` file and add the snippet below:

```yml
version: '3'

services:
  wp:
    image: wordpress:latest # https://hub.docker.com/_/wordpress/
    ports:
      - ${IP}:80:80 # change ip if required
    volumes:
      - ./config/php.conf.ini:/usr/local/etc/php/conf.d/conf.ini
      - ./wordpress:/var/www/html # Full wordpress project
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_NAME: "${DB_NAME}"
      WORDPRESS_DB_USER: root
      WORDPRESS_DB_PASSWORD: "${DB_ROOT_PASSWORD}"
    depends_on:
      - db
    links:
      - db

  pma:
    image: phpmyadmin/phpmyadmin
    environment:
      PMA_HOST: db
      PMA_PORT: 3306
      MYSQL_ROOT_PASSWORD: "${DB_ROOT_PASSWORD}"
    ports:
      - ${IP}:8080:80
    links:
      - db:db

  db:
    image: mysql:latest # https://hub.docker.com/_/mysql/ - or mariadb https://hub.docker.com/_/mariadb
    ports:
      - ${IP}:3306:3306 # change ip if required
    command: [
        '--default_authentication_plugin=mysql_native_password',
        '--character-set-server=utf8mb4',
        '--collation-server=utf8mb4_unicode_ci'
    ]
    volumes:
      - ./wp-data:/docker-entrypoint-initdb.d
      - db_data:/var/lib/mysql
    environment:
      MYSQL_DATABASE: "${DB_NAME}"
      MYSQL_ROOT_PASSWORD: "${DB_ROOT_PASSWORD}"

volumes:
  db_data:
```

This will spin up a Wordpress site, a MySQL server which will store your data (posts, pages, menus etc.) and a phpMyAdmin client that will let you access your server. Don't forget to set these variables in your `.env` file:
```
IP=127.0.0.1
DB_NAME=wordpress
DB_ROOT_PASSWORD=YOUR_DB_PASSWORD
```

Now run `docker-compose up` in your terminal and go to `http://127.0.0.1` in your browser to initialize your Wordpress site.

### Connecting Wordpress and Gatsby with WPGraphQL

We shall use the WPGraphQL plugin to expose our Wordpress content through a GraphQL API. You can download the plugin [here](https://github.com/wp-graphql/wp-graphql/releases). Go to `http://127.0.0.1/wp-admin` and in the menu go to **Plugins -> Add New** to install and activate the plugin. You will need set pretty permalinks (numeric, post name etc.) under **Settings -> Permalinks**. Your GraphQL API should now be exposed under `http://127.0.0.1/graphql`.

Next, we will need to connect Gatsby to the GraphQL API. Run `npm install --save gatsby-source-graphql-universal` in your project's root directory. This plugin will allow us to retrieve data from the GraphQL API both during build time on your server and during run time on your browser, as you will see later. Go to the `gatsby-config.js` file and add your plugin using the snippet below: 

```javascript
module.exports = {
    plugins: [
        {
            resolve: 'gatsby-source-graphql-universal',
            options: {
                // This type will contain remote schema Query type
                typeName: 'WPGraphQL',
                // This is field under which it's accessible
                fieldName: 'wpgraphql',
                // Url to query from
                url: `http://127.0.0.1/graphql`,
            },
        },
    ]
}
```

Run `gatsby develop` and wait for Gatsby to finish building a local version of your site. Once done, your site should be hosting at `http://localhost:8000`. You should also be able to query your GraphQL API at `http://localhost:8000/___graphql`.

**Note:** You might run into `babel-loader.js` issues when running the `gatsby develop` command due to [this issue](https://github.com/birkir/gatsby-source-graphql-universal/issues/3). Uninstall Gatsby by running `npm uninstall gatsby`, and then run `npm install --save gatsby@2.13.29` to install a Gatsby version compatible with gatsby-source-graphql-universal.

### Configuring Pages/Templates to Source from Wordpress

By default the Gatsby blog starter sources its content from local Markdown files. Let's configure Gatsby to source from our Wordpress instance instead. Head over to the `gatsby-node.js` file and first edit the GraphQL query to this:

```javascript
const result = await graphql(
    `
      {
        wpgraphql {
          posts{
            edges {
              node {
                slug
                title
              }
            }
          }
        }
      }
    `
  )
```

Next edit the createPage API to create pages using Wordpress data:

```javascript
  // Create blog posts pages.
const posts = result.data.wpgraphql.edges

posts.forEach((post, index) => {
  const previous = index === posts.length - 1 ? null : posts[index + 1].node
  const next = index === 0 ? null : posts[index - 1].node

  createPage({
    path: post.node.slug,
    component: blogPost,
    context: {
      slug: post.node.slug,
      previous,
      next,
    },
  })
})
```

We don't need this onCreateNode API for Wordpress, so go ahead and remove it:

```javascript
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
```

Go to `src/pages/`

### Hijacking the Preview Button in WP-Admin UI

We need the preview button to redirect us to our Gatsby site instead of the default Wordpress site. The 'preview_post_link' hook comes to our rescue! Add the filter below in the `wordpress/wp-content/themes/twentynineteen/functions.php` file.

```php
add_filter( 'preview_post_link', function( $link ) {
	global $post;
	$post_ID = $post->post_parent;
	return 'http://localhost:8000/'
        . 'preview?id='
        . $post_ID . '&wpnonce='
        . wp_create_nonce( 'wp_rest' );
});
```

Wordpress using nonces to authorize queries for post revisions/drafts. We will need to pass the post ID and the nonce to our Gatsby site, which will make a GraphQL query for the post revision exposed by the WPGraphQL plugin. The GraphQL query will send back the nonce to Wordpress in the 'x-wp-nonce' header. Lets edit the CORS permissions to allow this header in Wordpress by adding this filter in the `functions.php` file:

```php
add_filter( 'graphql_access_control_allow_headers', function( $headers ) {
	return array_merge( $headers, [ 'x-wp-nonce' ] );
});
```

Next we need to create a client-side only preview route in the Gatsby site (`localhost:8000/preview`). Head to the `gatsby-node.js` file in root and add this Gatsby API:

```javascript
// Client only routes for preview
exports.onCreatePage = async ({ page, actions }) => {
  const { createPage } = actions;

  // page.matchPath is a special key that's used for matching pages
  // only on the client.
  if (page.path.match(/^\/preview/)) {
    page.matchPath = '/preview/*';

    // Update the page.
    createPage(page);
  }
};
```

Run `gatsby develop` again to create the preview route.

```javascript
import React from 'react';
import PostPreview from '../components/PostPreview';

export default function Preview(props) {
  return (
    <PostPreview search={props.location.search} />
  );
}
```



