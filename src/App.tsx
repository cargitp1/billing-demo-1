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
import ClientLedger from './pages/ClientLedger';
import Billing from './pages/Billing';
import CreateBill from './pages/CreateBill';
import BillBook from './pages/BillBook';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const RootRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <RootRoute>
                  <Landing />
                </RootRoute>
              }
            />
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
              path="/bill-book"
              element={
                <ProtectedRoute>
                  <BillBook />
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
              path="/client-ledger"
              element={
                <ProtectedRoute>
                  <ClientLedger />
                </ProtectedRoute>
              }
            />
            <Route path="/billing">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <Billing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="create/:clientId"
                element={
                  <ProtectedRoute>
                    <CreateBill />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
