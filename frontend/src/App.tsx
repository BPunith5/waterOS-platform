import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { OceanBackground } from './components/water/OceanBackground';
import { DevPreviewPage } from './pages/DevPreview';

function App() {
  return (
    <BrowserRouter>
      <OceanBackground />
      <Routes>
        <Route path="/dev-preview" element={<DevPreviewPage />} />
        <Route path="*" element={<Navigate to="/dev-preview" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
