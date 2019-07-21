import React from 'react';
import { Link } from 'gatsby';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelopeSquare } from '@fortawesome/free-solid-svg-icons';
import { faGithubSquare, faLinkedin } from '@fortawesome/free-brands-svg-icons';

import styles from './layout.module.sass';

class Layout extends React.Component {
  render() {
    const { location, title, children } = this.props;
    const rootPath = `${__PATH_PREFIX__}/`;
    const header = (
      <h1 className={styles.title}>
        <Link className={styles.link} to={`/`}>
          {title}
        </Link>
      </h1>
    );

    return (
      <div className={styles.container}>
        <header>{header}</header>
        <main>{children}</main>
        <footer>
          <div>
            <ul className={styles.social}>
              <li>
                <a
                  href="https://www.linkedin.com/in/tony-le-16673a141"
                  target="_blank"
                >
                  <FontAwesomeIcon icon={faLinkedin} />

                  <p>Linkedin</p>
                </a>
              </li>
              <li>
                <a href="https://github.com/let00" target="_blank">
                  <FontAwesomeIcon icon={faGithubSquare} />
                  <p>Github</p>
                </a>
              </li>
              <li>
                {/* TODO: mail spam prevention */}
                <a href="mailto:tony.le@usa.com">
                  <FontAwesomeIcon icon={faEnvelopeSquare} />
                  <p>Email</p>
                </a>
              </li>
            </ul>
          </div>
          <div>
            © {new Date().getFullYear()}, Built with
            {` `}
            <a href="https://www.gatsbyjs.org">Gatsby</a>
          </div>
        </footer>
      </div>
    );
  }
}

export default Layout;
