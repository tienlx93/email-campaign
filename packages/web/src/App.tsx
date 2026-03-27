import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthenticatedLayout } from '@/layouts/AuthenticatedLayout';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { CampaignsListPage } from '@/pages/CampaignsListPage';
import { NewCampaignPage } from '@/pages/NewCampaignPage';
import { CampaignDetailPage } from '@/pages/CampaignDetailPage';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated routes */}
      <Route element={<AuthenticatedLayout />}>
        <Route path="/campaigns" element={<CampaignsListPage />} />
        <Route path="/campaigns/new" element={<NewCampaignPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/campaigns" replace />} />
    </Routes>
  );
}
