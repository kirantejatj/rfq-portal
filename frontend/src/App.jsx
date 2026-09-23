import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import TenderDetails from './pages/TenderDetails';
import CELogin from './pages/auth/CELogin';
import ApplicantLogin from './pages/auth/ApplicantLogin';
import ApplicantRegister from './pages/auth/ApplicantRegister';

// Applicant Pages
import ApplicantDashboard from './pages/applicant/ApplicantDashboard';
import MyApplications from './pages/applicant/MyApplications';
import SubmitQuotation from './pages/applicant/SubmitQuotation';

// CE Pages
import CEDashboard from './pages/ce/CEDashboard';
import CreateTender from './pages/ce/CreateTender';
import EditTender from './pages/ce/EditTender';
import TenderSubmissions from './pages/ce/TenderSubmissions';
import ApplicationReview from './pages/ce/ApplicationReview';
import ApprovedNonSorItems from './pages/ce/ApprovedNonSorItems';

// Developer / API Workbench
import ApiWorkbench from './pages/admin/ApiWorkbench';

const ProtectedRoute = ({ children, roleRequired }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-gov-600 border-t-transparent rounded-full mx-auto"></div>
    </div>
  );
  if (!user) {
    if (roleRequired === 'CE') return <Navigate to="/ce/login" replace />;
    return <Navigate to="/applicant/login" replace />;
  }
  if (roleRequired === 'CE' && !['CE', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return <Navigate to="/ce/login" replace />;
  }
  if (roleRequired === 'APPLICANT' && user.role !== 'APPLICANT') {
    return <Navigate to="/applicant/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tenders/:id" element={<TenderDetails />} />
          <Route path="/ce/login" element={<CELogin />} />
          <Route path="/applicant/login" element={<ApplicantLogin />} />
          <Route path="/applicant/register" element={<ApplicantRegister />} />

          {/* Applicant Routes */}
          <Route path="/applicant/dashboard" element={
            <ProtectedRoute roleRequired="APPLICANT">
              <ApplicantDashboard />
            </ProtectedRoute>
          } />
          <Route path="/applicant/my-applications" element={
            <ProtectedRoute roleRequired="APPLICANT">
              <MyApplications />
            </ProtectedRoute>
          } />
          <Route path="/applicant/apply/:tenderId" element={
            <ProtectedRoute roleRequired="APPLICANT">
              <SubmitQuotation />
            </ProtectedRoute>
          } />

          {/* CE Routes */}
          <Route path="/ce/dashboard" element={
            <ProtectedRoute roleRequired="CE">
              <CEDashboard />
            </ProtectedRoute>
          } />
          <Route path="/ce/tenders/create" element={
            <ProtectedRoute roleRequired="CE">
              <CreateTender />
            </ProtectedRoute>
          } />
          <Route path="/ce/tenders/:tenderId/edit" element={
            <ProtectedRoute roleRequired="CE">
              <EditTender />
            </ProtectedRoute>
          } />
          <Route path="/ce/tenders/:tenderId/submissions" element={
            <ProtectedRoute roleRequired="CE">
              <TenderSubmissions />
            </ProtectedRoute>
          } />
          <Route path="/ce/applications/:applicationId/review" element={
            <ProtectedRoute roleRequired="CE">
              <ApplicationReview />
            </ProtectedRoute>
          } />
          <Route path="/ce/approved-non-sor-items" element={
            <ProtectedRoute roleRequired="CE">
              <ApprovedNonSorItems />
            </ProtectedRoute>
          } />
          <Route path="/approved-non-sor-items" element={<ApprovedNonSorItems />} />

          {/* Developer / API Workbench Route */}
          <Route path="/developer" element={<ApiWorkbench />} />
          <Route path="/api-explorer" element={<ApiWorkbench />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
