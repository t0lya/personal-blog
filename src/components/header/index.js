import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import cx from 'classnames';
import OutsideClickHandler from 'react-outside-click-handler';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faTimes,
  faEnvelopeSquare,
} from '@fortawesome/free-solid-svg-icons';
import { faGithubSquare, faLinkedin } from '@fortawesome/free-brands-svg-icons';

import styles from './header.module.scss';
import logo from '../../images/baseline-code-24px.svg';

const Header = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);

  const onHamburgerClick = () => {
    setIsExpanded(expandedState => !expandedState);
  };

  return (
    <header
      className={cx(styles.header, {
        [styles.headerExpanded]: isExpanded,
      })}
      ref={containerRef}
    >
      <OutsideClickHandler
        onOutsideClick={() => {
          setIsExpanded(false);
        }}
      >
        <div className={styles.topBar}>
          <Link className={styles.logo} to="/">
            <img src={logo} alt="" />
            <span>Tony Le</span>
          </Link>
          <button
            className={styles.hamburger}
            onClick={onHamburgerClick}
            type="button"
            aria-label="Navigation Menu"
          >
            <FontAwesomeIcon icon={isExpanded ? faTimes : faBars} />
          </button>
        </div>
        <div
          className={cx(styles.dropdown, {
            [styles.dropdownExpanded]: isExpanded,
          })}
        >
          <ul className={styles.menu}>
            <li>
              <a
                href="https://www.linkedin.com/in/tony-le-16673a141"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faLinkedin} />
                <span>Linkedin</span>
              </a>
            </li>
            <li>
              <a
                href="https://github.com/t0lya"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faGithubSquare} />
                <span>Github</span>
              </a>
            </li>
            <li>
              <a href="mailto:tony.le@usa.com">
                <FontAwesomeIcon icon={faEnvelopeSquare} />
                <span>Email</span>
              </a>
            </li>
          </ul>
          {children}
        </div>
      </OutsideClickHandler>
    </header>
  );
};

Header.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

Header.defaultProps = {
  children: null,
};

export default Header;
