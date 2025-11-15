import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import CommentPage from './pages/CommentPage';
import Messages from './pages/Messages';
import Approved from './components/Approved';
import Rejected from './components/Rejected';
import Analytics from './pages/Analytics';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import PrivateSend from "./pages/PrivateSend";
import News from "./pages/News";
import Events from "./pages/Events";

// Component to conditionally show NotFound
function NotFoundWrapper() {
  const location = useLocation();
  const hideNotFound = ['/', '/register'];

  return !hideNotFound.includes(location.pathname) ? <NotFound /> : null;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/comments/:id" element={<CommentPage />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/approved" element={<Approved />} />
        <Route path="/rejected" element={<Rejected />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/private" element={<PrivateSend/>} />
        <Route path="/news" element={<News/>} />
        <Route path="/events" element={<Events/>} />
      </Routes>
      <NotFoundWrapper />
      <Layout />
    </BrowserRouter>
  );
}

export default App;