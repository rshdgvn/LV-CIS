import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Events from "./pages/Events";
import Clubs from "./pages/clubs memberships/Clubs";
import ClubDetails from "./pages/clubs memberships/ClubDetails"; 
import GoogleCallback from "./GoogleCallback";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./contexts/ProtectedRoute";
import PendingClubs from "./pages/clubs memberships/PendingClubs";
import NotFound from "./pages/errors/NotFound";
import AdminRoute from "./contexts/AdminRoute";
import MemberDetails from "./pages/clubs memberships/MemberDetails";
import Profile from "./pages/Profile";
import PendingRequests from "./pages/clubs memberships/PendingRequests";
import ClubRoleRequests from "./pages/clubs memberships/ClubRoleRequest";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/google/callback" element={<GoogleCallback />} />
          <Route path="*" element={<NotFound />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/events" element={<Events />} />
            <Route path="/clubs" element={<Clubs />} />
            <Route path="/club/:id" element={<ClubDetails />} /> 
            <Route path="/club/:id/pending-requests" element={<PendingRequests />} />
            <Route path="/pending-clubs" element={<PendingClubs />} />
            <Route path="/club/:clubId/members/:userId" element={<MemberDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/club/:clubId/role-change-requests"element={<ClubRoleRequests />}/>
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
