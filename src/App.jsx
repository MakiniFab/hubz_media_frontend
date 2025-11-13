import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import CommentPage from './pages/CommentPage';
import Messages from './pages/Messages';
import Approved from './components/Approved';
import Rejected from './components/Rejected';
import Layout from './components/Layout';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';

function AppRoutes() {
  const location = useLocation();
  const hideLogoutPaths = ['/', '/register'];

  return (
    <>
      {/* Render logout if current path is not / or /register */}
      {!hideLogoutPaths.includes(location.pathname) && <NotFound />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard/>} />
        <Route path="/comments/:id" element={<CommentPage />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/approved" element={<Approved/>} />
        <Route path="/rejected" element={<Rejected/>} />
        <Route path="/analytics" element={<Analytics/>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;