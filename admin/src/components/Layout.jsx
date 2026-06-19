import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => (
  <div className="admin-layout">
    <Sidebar />
    <main className="main-content">{children}</main>
  </div>
);

export default Layout;