import React from 'react';
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
