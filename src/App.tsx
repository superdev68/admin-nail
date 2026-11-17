import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import Layout from "./components/Layout";
import AppointmentsPage from "./pages/AppointmentsPage";
import DashboardPage from "./pages/DashboardPage";
import LocationsPage from "./pages/LocationsPage";
import LoginPage from "./pages/LoginPage";
import ServiceCategoriesPage from "./pages/ServiceCategoriesPage";
import ServicesPage from "./pages/ServicesPage";
import TechnicianSchedulesPage from "./pages/TechnicianSchedulesPage";
import TechniciansPage from "./pages/TechniciansPage";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { username, ready } = useAuth();
  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
          <p className="text-sm font-medium text-brand-deep">Đang tải Nail Room Admin...</p>
        </div>
      </div>
    );
  }
  return username ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="locations" element={<LocationsPage />} />
        <Route path="service-categories" element={<ServiceCategoriesPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="technicians" element={<TechniciansPage />} />
        <Route path="schedules" element={<TechnicianSchedulesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
