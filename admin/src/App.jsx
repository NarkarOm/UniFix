import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StaffDetail from './pages/StaffDetail';
import { ThemeProvider } from './theme/ThemeProvider';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('unifix_admin_token');
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/:section" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/staff/:uid" element={<ProtectedRoute><StaffDetail /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}