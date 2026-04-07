import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { AccountLayout } from './layouts/AccountLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute, UserAccountRoute } from './components/common/ProtectedRoute';
import HomePage from './pages/HomePage';
import FleetPage from './pages/FleetPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/register/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/account/ProfilePage';
import SavedCarsPage from './pages/account/SavedCarsPage';
import BookingsPage from './pages/account/BookingsPage';
import SettingsPage from './pages/account/SettingsPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminCarsPage from './pages/admin/cars/CarsPage';
import AdminBookingsPage from './pages/admin/BookingsPage';
import AdminCustomersPage from './pages/admin/CustomersPage';
import AdminSettingsPage from './pages/admin/SettingsPage';
import AdminAnalyticsPage from './pages/admin/AnalyticsPage';
import AdminReportsPage from './pages/admin/ReportsPage';
import AdminAdsPage from './pages/admin/AdsPage';
import { LanguageSwitcher } from './components/common/LanguageSwitcher';
import { ThemeToggle } from './components/common/ThemeToggle';
import { Box } from '@mantine/core';
import { AdPageShell, AdsVerticalLayout } from './layouts/AdPageShell';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyPhonePage from './pages/register/VerifyPhonePage ';
import AdminCarDataPage from './pages/admin/cars/AdminCarDataPage ';

export default function App() {
  return (
    <>

      <div
        style={{
          position: "fixed",
          bottom: 16,
          left: 16,
          zIndex: 9999,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/fleet" element={<FleetPage />} />
          <Route path="/fleet/:id" element={<VehicleDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-phone" element={<VerifyPhonePage />} />

        <Route element={<UserAccountRoute />}>
          <Route element={<AccountLayout />}>
            <Route path="/account" element={<Navigate to="/account/profile" replace />} />
            <Route path="/account/profile" element={<ProfilePage />} />
            <Route path="/account/saved" element={<SavedCarsPage />} />
            <Route path="/account/bookings" element={<BookingsPage />} />
            <Route path="/account/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute requireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/cars" element={<AdminCarsPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/customers" element={<AdminCustomersPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/ads" element={<AdminAdsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/car-data" element={<AdminCarDataPage />}  />
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <AdsVerticalLayout>
              <NotFoundPage />
            </AdsVerticalLayout>
          }
        />
      </Routes>
    </>
  );
}
