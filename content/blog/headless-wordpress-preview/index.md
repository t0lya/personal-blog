---
title: Preview in Headless Wordpress with Gatsby
description: 'How to enable preview of posts in Headless Wordpress stack using hydration in Gatsby'
date: '2019-07-30'
---

Gatsby is an open source framework based on React that builds static pages server side, allowing lightning fast loading of web pages. Gatsby solves security, speed and SEO concerns that Wordpress sites may have, which makes it a popular solution for using Wordpress as a headless CMS. In this post I will show you how to preview your posts with Gatsby templates in the Wordpress Admin UI. Check out the [source code](https://github.com/let00/headless-wordpress-preview) for the tutorial.

### Initial Setup

If you already have a Gatsby project and a Wordpress instance set up, you can skip this section. First, let's install the Gatsby client and create a default starter blog (install [Node](https://nodejs.org/en/download/) if you haven't already). Run these commands in your terminal:

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

Now run `docker-compose up` in your terminal and go to `http://127.0.0.1` in your browser to initialize your Wordpress site. If needed, you can access the phpMyAdmin client at `http://127.0.0.1:3306`.

### Connecting Wordpress and Gatsby with WPGraphQL

We will use the WPGraphQL plugin to expose our Wordpress content through a GraphQL API. [Download the plugin](https://github.com/wp-graphql/wp-graphql/releases) if you have not already. Go to `http://127.0.0.1/wp-admin` and in the navigation bar go to **Plugins -> Add New** to install the zip file and activate the plugin. You will need set pretty permalinks (post name will do) under **Settings -> Permalinks**. Your GraphQL API should now be exposed under `http://127.0.0.1/graphql`.

Next, we will need to connect Gatsby to the GraphQL API. Run `npm install --save gatsby-source-graphql-universal` in your project's root directory. This plugin will allow us to retrieve data from the GraphQL API both during build time and during run time in the browser, as you will see later. Go to the `gatsby-config.js` file and add your plugin using the snippet below:

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
  ],
};
```

Run `gatsby develop` and wait for Gatsby to spin up a local version of your site. Once done, your site should be available at `http://localhost:8000`. You should also be able to query your GraphQL API at `http://localhost:8000/___graphql`.

**Note:** You might run into `babel-loader.js` issues when running the `gatsby develop` command due to [this issue](https://github.com/birkir/gatsby-source-graphql-universal/issues/3). Uninstall Gatsby by running `npm uninstall gatsby`, and then run `npm install --save gatsby@2.13.29` to install a Gatsby version compatible with the 'gatsby-source-graphql-universal' plugin.

### Configuring Pages/Templates to Source from Wordpress

By default the Gatsby blog starter sources its content from Markdown files in `content/blog`. Let's configure Gatsby to source from our Wordpress instance instead. Head over to the `gatsby-node.js` file and first edit the GraphQL query to this:

```javascript
const result = await graphql(
  `
    {
      wpgraphql {
        posts {
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
);
```

Next edit the createPage API to create pages using Wordpress data:

```javascript
// Create blog posts pages.
const posts = result.data.wpgraphql.posts.edges;

posts.forEach((post, index) => {
  const previous = index === posts.length - 1 ? null : posts[index + 1].node;
  const next = index === 0 ? null : posts[index - 1].node;

  createPage({
    path: post.node.slug,
    component: blogPost,
    context: {
      slug: post.node.slug,
      previous,
      next,
    },
  });
});
```

We don't need this onCreateNode API for Wordpress, so go ahead and remove it:

```javascript
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode });
    createNodeField({
      name: `slug`,
      node,
      value,
    });
  }
};
```

All that's left to do is to edit our 'index' page and 'blog-post' template. Go to `src/pages/index.js`. First change the query to source data from WPGraphql instead of Markdown Remark.

```javascript
export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    wpgraphql {
      posts {
        edges {
          node {
            excerpt
            slug
            date
            title
          }
        }
      }
    }
  }
`;
```

Our query result will be available under the 'data' prop in the 'BlogIndex' component. So lets adjust the component to use our new query.

```javascript
class BlogIndex extends React.Component {
  render() {
    const { data } = this.props;
    const siteTitle = data.site.siteMetadata.title;
    const posts = data.wpgraphql.posts.edges;

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO title="All posts" />
        {posts.map(({ node }) => {
          const title = node.title || node.slug;
          return (
            <div key={node.slug}>
              <h3
                style={{
                  marginBottom: rhythm(1 / 4),
                }}
              >
                <Link style={{ boxShadow: `none` }} to={node.slug}>
                  {title}
                </Link>
              </h3>
              <small>{node.date}</small>
              <p
                dangerouslySetInnerHTML={{
                  __html: node.excerpt,
                }}
              />
            </div>
          );
        })}
      </Layout>
    );
  }
}
```

Last but not least we need to change our 'blog-post' template. Head over to `src/pages/blog-post.js` and edit your query as below:

```javascript
export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    wpgraphql {
      postBy(slug: $slug) {
        excerpt
        content
        title
        date
      }
    }
  }
`;
```

Here is how the 'BlogPostTemplate' component should look like:

```javascript
class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.wpgraphql.postBy;
    const siteTitle = this.props.data.site.siteMetadata.title;
    const { previous, next } = this.props.pageContext;

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO title={post.title} description={post.excerpt} />
        <h1
          style={{
            marginTop: rhythm(1),
            marginBottom: 0,
          }}
        >
          {post.title}
        </h1>
        <p
          style={{
            ...scale(-1 / 5),
            display: `block`,
            marginBottom: rhythm(1),
          }}
        >
          {post.date}
        </p>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
        <hr
          style={{
            marginBottom: rhythm(1),
          }}
        />
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous.slug} rel="prev">
                ← {previous.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.slug} rel="next">
                {next.title} →
              </Link>
            )}
          </li>
        </ul>
      </Layout>
    );
  }
}
```

### Hijacking the Preview Button in WP-Admin UI

We need the preview button to redirect us to our Gatsby site instead of the default Wordpress site. The 'preview_post_link' hook comes to our rescue! Add the filter below in the `wordpress/wp-content/themes/twentynineteen/functions.php` file. Note how we are passing the post slug and nonce. We will need it later for querying the post we want to preview. 

```php
add_filter('preview_post_link', function ($link) {
	global $post;
	$post_ID = $post->post_parent;
	$post_slug = get_post_field( 'post_name', $post_id );
	return 'http://localhost:8000/'
		. 'preview?slug='
		. $post_slug . '&wpnonce='
		. wp_create_nonce('wp_rest');
});
```

Wordpress using nonces to authorize queries for post revisions/drafts. We will need to pass the post ID and the nonce to our Gatsby site, which will make a GraphQL query for the post revision exposed by the WPGraphQL plugin. The GraphQL query will send back the nonce to Wordpress in the 'x-wp-nonce' header. Lets edit the CORS permissions to allow this header in Wordpress by adding this filter in the `functions.php` file:

```php
add_filter( 'graphql_access_control_allow_headers', function( $headers ) {
	return array_merge( $headers, [ 'x-wp-nonce' ] );
});
```

We will also need to send our credentials stored in cookies set by Wordpress along with the nonce for authorization. Unfortunately, the CORS policy does not allow us to send credentials with `Access-Control-Allow-Origin` set to a wildcard. So head over to `wordpress/wp-content/plugins/wpgraphql/src/Router.php` and make the following change:

```php
'Access-Control-Allow-Origin'  => 'http://localhost:8000',
'Access-Control-Allow-Credentials' => 'true',
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

Go to `src/pages` and create a `preview.js` file as below for your preview route:

```javascript
import React from 'react';
import BlogPostTemplate from '../templates/blog-post';

export default function Preview() {
  return <BlogPostTemplate />;
}
```

The preview route is created on build time, so we need to run `gatsby develop` again to see the route on our browser. If you click on the preview button in WP-Admin UI, you should be see a Gatsby page instead of the usual Wordpress one (albeit with errors that we will fix in the next section).

### Fetching Live Post Data for Preview

Someone goes into Wordpress, clicks on a post and changes the content. How do we send the updated content to our Gatsby site? As I mentioned earlier, this is where the 'gatsby-source-graphql-universal' plugin will allow us to fetch live data from WPGraphQL. Of course, you can use other GraphQL clients such as Apollo Client, but I found this plugin much easier to set up. All you will need to do is wrap the Preview component with the `withGraphql` higher order component like so:

```javascript
import { withGraphql } from 'gatsby-source-graphql-universal'

function Preview({ graphql }) {
  return <BlogPostTemplate />;
}

export default withGraphql(Preview);
```

When someone changes a post's content, all its data is stored in a revision object. Fortunately for us, WPGraphQL exposes revisions so that we can query them client-side in Gatsby. Add the query below in `preview.js`:

```javascript
export const query = graphql`
  query BlogTemplatePreviewQuery($slug: String!) {
    wpgraphql {
      postBy(slug: $slug) {
        revisions(last: 1, before: null) {
          nodes {
            excerpt
            content
            title
            date
          }
        }
      }
    }
  }
`;
```

Now we can use the `graphql` prop to fetch the data and then store it in the Preview component's state. We have the slug and nonce in the preview URL, so we can grab the post we want to preview. So run `npm install --save query-string`; this module will help us extract the slug and nonce. Then use a React hook to fetch when the component mounts:

```javascript
import React, { useEffect, useState } from 'react';
import BlogPostTemplate from '../templates/blog-post';
import { withGraphql } from 'gatsby-source-graphql-universal';
import qs from 'query-string';
import { graphql } from 'gatsby';

function Preview({ graphql }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      const { slug, wpnonce } = qs.parse(location.search);
      const context = {
        headers: {
          'X-WP-Nonce': wpnonce,
        },
        credentials: 'include',
      };
      try {
        const { data } = await graphql('wpgraphql', {
          query,
          context,
          variables: { slug },
        });
        setPost(data.postBy.revisions.nodes[0]);
        setLoading(false);
      } catch (error) {
        setError(error);
        throw Error(error);
      }
    };
    fetchPost();
  }, []);

  if (error !== null) {
    return <span>{error}</span>;
  }
  if (loading) {
    return <span>Loading...</span>;
  }
  return <BlogPostTemplate preview={post} location={'/preview'} />;
}

export default withGraphql(Preview);
```

We are passing the latest revision as a `preview` prop in the BlogPostTemplate. We need to adjust our `blog-post` template to use the revision data. Make the following changes in the BlogPostTemplate component:

```javascript
let post, siteTitle, previous, next;
if (this.props.preview) {
  post = this.props.preview;
  siteTitle = 'Preview';
  previous = null;
  next = null;
} else {
  post = this.props.data.wpgraphql.postBy;
  siteTitle = this.props.data.site.siteMetadata.title;
  ({ previous, next } = this.props.pageContext);
}
```

Great, we are finally done! Hopefully the preview feature is working for you. 