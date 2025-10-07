import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClientManagement from './pages/ClientManagement';
import UdharChallan from './pages/UdharChallan';
import JamaChallan from './pages/JamaChallan';
import StockManagement from './pages/StockManagement';
import ChallanBook from './pages/ChallanBook';
import Ledger from './pages/Ledger';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients"
              element={
                <ProtectedRoute>
                  <ClientManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/udhar-challan"
              element={
                <ProtectedRoute>
                  <UdharChallan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jama-challan"
              element={
                <ProtectedRoute>
                  <JamaChallan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stock"
              element={
                <ProtectedRoute>
                  <StockManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/challan-book"
              element={
                <ProtectedRoute>
                  <ChallanBook />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ledger"
              element={
                <ProtectedRoute>
                  <Ledger />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
