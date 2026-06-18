import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { OceanThemeProvider } from './context/OceanThemeContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AppShell } from './layouts/AppShell';
import { LoginPage } from './pages/auth/Login';
import { SignupPage } from './pages/auth/Signup';
import { LandingPage } from './pages/landing/LandingPage';
import { DashboardPage } from './pages/Dashboard';
import { TanksPage } from './pages/tanks/TanksPage';
import { TankFormPage } from './pages/tanks/TankFormPage';
import { TankDetailPage } from './pages/tanks/TankDetailPage';
import { DevicesPage } from './pages/devices/DevicesPage';
import { AddDevicePage } from './pages/devices/AddDevicePage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { AlertsPage } from './pages/alerts/AlertsPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { MapPage } from './pages/MapPage';
import { DevPreviewPage } from './pages/DevPreview';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <OceanThemeProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/dev-preview" element={<DevPreviewPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route path="/app" element={<DashboardPage />} />
                  <Route path="/tanks" element={<TanksPage />} />
                  <Route path="/tanks/new" element={<TankFormPage mode="create" />} />
                  <Route path="/tanks/:id" element={<TankDetailPage />} />
                  <Route path="/tanks/:id/edit" element={<TankFormPage mode="edit" />} />
                  <Route path="/devices" element={<DevicesPage />} />
                  <Route path="/devices/add" element={<AddDevicePage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/map" element={<MapPage />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Routes>
          </OceanThemeProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
