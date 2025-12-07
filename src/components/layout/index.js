import React from 'react';
import 'prismjs/themes/prism-tomorrow.css';

import { main } from './layout.module.scss';
import Header from '../header';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main className={main}>{children}</main>
    </>
  );
};

export default Layout;
