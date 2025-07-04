import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Frame from '../components/Frame';

const MainLayout = () => {
  const { logout } = useAuth();

  return (
    <Frame onLogout={logout}>
      <Outlet />
    </Frame>
  );
};

export default MainLayout;
