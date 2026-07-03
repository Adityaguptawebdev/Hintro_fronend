import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

import LandingPage from '../pages/Landing/LandingPage';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import OAuthCallbackPage from '../features/auth/pages/OAuthCallbackPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import MeetingsPage from '../features/meetings/pages/MeetingsPage';
import MeetingDetailPage from '../features/meetings/pages/MeetingDetailPage';
import TranscriptPage from '../features/transcript/pages/TranscriptPage';
import InsightsPage from '../features/ai-insights/pages/InsightsPage';
import ActionItemsPage from '../features/action-items/pages/ActionItemsPage';
import RemindersPage from '../features/reminders/pages/RemindersPage';
import SettingsPage from '../features/settings/pages/SettingsPage';
import MeetingRoomPage from '../features/meetings/pages/MeetingRoomPage';
import NotFoundPage from '../pages/NotFound/NotFoundPage';

const AppRouter = () => (
  <Routes>
    {/* Public landing page */}
    <Route path="/" element={<LandingPage />} />

    {/* Auth routes */}
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Route>

    {/* OAuth redirect target — standalone, no layout */}
    <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

    {/* Protected app routes */}
    <Route element={<PrivateRoute />}>
      {/* Full-screen meeting room — no sidebar/topbar */}
      <Route path="/meetings/:id/room" element={<MeetingRoomPage />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/meetings" element={<MeetingsPage />} />
        <Route path="/meetings/:id" element={<MeetingDetailPage />} />
        <Route path="/meetings/:id/transcript" element={<TranscriptPage />} />
        <Route path="/meetings/:id/insights" element={<InsightsPage />} />
        <Route path="/action-items" element={<ActionItemsPage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRouter;
