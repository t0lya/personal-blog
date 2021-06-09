import React from 'react';
import { Link } from 'gatsby';

import Layout from '../components/layout';
import SEO from '../components/seo';

class HomePage extends React.Component {
  render() {
    return (
      <Layout>
        <SEO title="Home page" />
        <ul>
          <li>
            <h2>
              <Link to="/posts">Posts</Link>
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

export default HomePage;
