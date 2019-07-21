import React from 'react';
import { Link, graphql } from 'gatsby';

import Layout from '../components/layout';
import SEO from '../components/seo';

class BlogIndex extends React.Component {
  render() {
    const { data } = this.props;
    const siteTitle = data.site.siteMetadata.title;

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO title="Home page" />
        <ul>
          <li>
            <h2>
              <Link to="/posts">Posts</Link>
            </h2>
          </li>
          <li>
            <h2>
              <a>Resume</a>
            </h2>
          </li>
          <li>
            <h2>
              <Link to="/about">About</Link>
            </h2>
          </li>
        </ul>
      </Layout>
    );
  }
}

export default BlogIndex;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`;
