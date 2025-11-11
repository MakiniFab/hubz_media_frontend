import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import CommentPage from './pages/CommentPage';
import Messages from './pages/Messages';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard/>} />
          <Route path="/comment/:id" element={<CommentPage />} />
          <Route path="/messages" element={<Messages />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;