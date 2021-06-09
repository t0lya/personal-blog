import React from 'react';
import { Link } from 'gatsby';
import styles from './pagination.module.scss';

export default function Pagination({ previous, next }) {
  return (
    <ul className={styles.pagination}>
      <li>
        {previous && (
          <Link to={previous.fields.slug} rel="prev">
            ← {previous.frontmatter.title}
          </Link>
        )}
      </li>
      <li>
        {next && (
          <Link to={next.fields.slug} rel="next">
            {next.frontmatter.title} →
          </Link>
        )}
      </li>
    </ul>
  );
}
