import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { HomeContentList } from './HomeContentList';
import { HomeContentForm } from './HomeContentForm';
import { HomeContentDetail } from './HomeContentDetail';

const HomeContentSettings: React.FC = () => {
  return (
    <Routes>
      <Route index element={<HomeContentList />} />
      <Route path='new' element={<HomeContentForm isEdit={false} />} />
      <Route path='edit/:id' element={<HomeContentForm isEdit={true} />} />
      <Route path='detail/:id' element={<HomeContentDetail />} />
      <Route path='*' element={<Navigate to='/home-content-settings' replace />} />
    </Routes>
  );
};

export default HomeContentSettings;
