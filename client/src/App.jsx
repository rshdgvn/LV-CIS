import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Events from "./pages/Events";
import Clubs from "./pages/Clubs";
import ClubDetails from "./pages/ClubDetails"; 
import GoogleCallback from "./GoogleCallback";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./contexts/ProtectedRoute";
import PendingClubs from "./pages/PendingClubs";
import NotFound from "./pages/errors/NotFound";
import AdminRoute from "./contexts/AdminRoute";
import MemberDetails from "./pages/MemberDetails";

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
            <Route path="/pending-clubs" element={<PendingClubs />} />
            <Route path="/clubs/:clubId/members/:userId" element={<MemberDetails />} />


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
