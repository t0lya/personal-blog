/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

import styles from './bio.module.sass';

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      site {
        siteMetadata {
          author
          social {
            twitter
          }
        }
      }
    }
  `);

  const { author, social } = data.site.siteMetadata;
  return (
    <div className={styles.container}>
      <p>
        <strong>
          Software Engineer Intern at Kabbage based in Atlanta, GA.
        </strong>
      </p>
      <p>
        Currently working on headless CMS solutions using GatsbyJS and
        Wordpress. I will mainly post tutorials here for things that I have
        worked on that I feel like are worth sharing.
      </p>
    </div>
  );
};

export default Bio;
