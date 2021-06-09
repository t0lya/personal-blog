import React from 'react';
import { Link } from 'gatsby';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelopeSquare } from '@fortawesome/free-solid-svg-icons';
import { faGithubSquare, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import 'prismjs/themes/prism-tomorrow.css';

import styles from './layout.module.scss';

const Layout = ({ children }) => {
  return (
    <div className={styles.container}>
      <header>
        <h1 className={styles.title}>
          <Link className={styles.link} to="/">
            Tony Le
          </Link>
        </h1>
      </header>
      <main>{children}</main>
      <footer>
        <div>
          <ul className={styles.social}>
            <li>
              <a
                href="https://www.linkedin.com/in/tony-le-16673a141"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faLinkedin} />
                <p>Linkedin</p>
              </a>
            </li>
            <li>
              <a
                href="https://github.com/t0lya"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faGithubSquare} />
                <p>Github</p>
              </a>
            </li>
            <li>
              <a href="mailto:tony.le@usa.com">
                <FontAwesomeIcon icon={faEnvelopeSquare} />
                <p>Email</p>
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
