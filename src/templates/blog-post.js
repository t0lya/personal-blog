import React from 'react';
import { graphql } from 'gatsby';

import Layout from '../components/layout';
import SEO from '../components/seo';
import Pagination from '../components/pagination';

import styles from './blog-post.module.scss';

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark;
    const { previous, next } = this.props.pageContext;

    return (
      <Layout>
        <SEO
          title={post.frontmatter.title}
          description={post.frontmatter.description || post.excerpt}
        />
        <h1 className={styles.title}>{post.frontmatter.title}</h1>
        <p className={styles.date}>{post.frontmatter.date}</p>
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
        <Pagination previous={previous} next={next} />
      </Layout>
    );
  }
}

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
      }
    }
  }
`;
