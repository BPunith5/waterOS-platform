import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AppShell } from './layouts/AppShell';
import { LoginPage } from './pages/auth/Login';
import { SignupPage } from './pages/auth/Signup';
import { DashboardPage } from './pages/Dashboard';
import { TanksPage } from './pages/tanks/TanksPage';
import { TankFormPage } from './pages/tanks/TankFormPage';
import { TankDetailPage } from './pages/tanks/TankDetailPage';
import { DevPreviewPage } from './pages/DevPreview';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dev-preview" element={<DevPreviewPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/tanks" element={<TanksPage />} />
                <Route path="/tanks/new" element={<TankFormPage mode="create" />} />
                <Route path="/tanks/:id" element={<TankDetailPage />} />
                <Route path="/tanks/:id/edit" element={<TankFormPage mode="edit" />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
