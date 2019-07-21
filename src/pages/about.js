import React from 'react';
import { graphql } from 'gatsby';

import Bio from '../components/bio';
import Layout from '../components/layout';
import SEO from '../components/seo';

export default function About(props) {
  const siteTitle = props.data.site.siteMetadata.title;

  return (
    <Layout location={props.location} title={siteTitle}>
      <SEO title="About" />
      <Bio />
    </Layout>
  );
}

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`;
