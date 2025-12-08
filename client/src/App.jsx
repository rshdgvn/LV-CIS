import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/events/Events";
import Clubs from "./pages/clubs memberships/Clubs";
import ClubDetails from "./pages/clubs memberships/ClubDetails";
import GoogleCallback from "./pages/auth/GoogleCallback";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./contexts/ProtectedRoute";
import PendingClubs from "./pages/clubs memberships/PendingClubs";
import NotFound from "./pages/errors/NotFound";
import AdminRoute from "./contexts/AdminRoute";
import MemberDetails from "./pages/clubs memberships/MemberDetails";
import Profile from "./pages/Profile";
import PendingRequests from "./pages/clubs memberships/PendingRequests";
import { ClubProvider } from "./contexts/ClubContext";
import OfficersRoute from "./contexts/OfficersRoute";
import Layout from "./components/app/layout";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";
import Unauthorized from "./pages/errors/Unauthorized";
import Forbidden from "./pages/errors/Forbidden";
import EventDetails from "./pages/events/EventDetails";
import AllClubsPage from "./pages/AllClubsPage";
import EventTasksTable from "./pages/events/EventTasksTable";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Attendances from "./pages/attendances/Attendances";
import AttendanceDetails from "./pages/attendances/AttendanceDetails";
import Signup from "./pages/auth/Signup";
import VerifyEmail from "./pages/auth/VerifyEmail";
import { ToastProvider } from "./providers/ToastProvider";
import GoogleLoginError from "./pages/errors/GoogleLoginError";
import GoogleSignupSuccess from "./pages/auth/GoogleSignupSuccess";
import PrivacyPolicy from "./pages/Privacy";
import TermsOfService from "./pages/Terms";
import MemberAttendances from "./components/events/MemberAttendances";
import Announcements from "./pages/system/Announcements";
import CalendarPage from "./pages/system/CalendarPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ClubProvider>
            <ToastProvider>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="all-clubs" element={<AllClubsPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/google/callback" element={<GoogleCallback />} />
                <Route
                  path="/google/signup/success"
                  element={<GoogleSignupSuccess />}
                />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  element={
                    <Layout>
                      <ProtectedRoute />
                    </Layout>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/attendance" element={<Attendances />} />

                  <Route path="/events" element={<Events />} />
                  <Route path="/clubs" element={<Clubs />} />
                  <Route path="/club/:id" element={<ClubDetails />} />
                  <Route path="/pending-clubs" element={<PendingClubs />} />
                  <Route
                    path="/club/:clubId/members/:userId"
                    element={<MemberDetails />}
                  />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/announcements" element={<Announcements />} />

                  <Route element={<OfficersRoute />}>
                    <Route
                      path="/club/:id/pending-requests"
                      element={<PendingRequests />}
                    />
                  </Route>

                  <Route element={<AdminRoute />}>
                    <Route
                      path="/admin/dashboard"
                      element={<AdminDashboard />}
                    />
                  </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/forbidden" element={<Forbidden />} />
                <Route path="/google/error" element={<GoogleLoginError />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/events/:id/tasks" element={<EventTasksTable />} />
                <Route path="/attendance/:id" element={<AttendanceDetails />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route
                  path="/member-attendances/:userId/:clubId"
                  element={<MemberAttendances />}
                />
                F
              </Routes>
            </ToastProvider>
          </ClubProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
