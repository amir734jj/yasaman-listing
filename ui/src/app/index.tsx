import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout';
import ProtectedRoute from '../components/protected-route';
import ListingsPage from '../pages/listings';
import ListingDetailPage from '../pages/listing-detail';
import CreateListingPage from '../pages/create-listing';
import LoginPage from '../pages/login';
import RegisterPage from '../pages/register';
import AdminUsersPage from '../pages/admin-users';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ListingsPage />} />
        <Route path="listings/:id" element={<ListingDetailPage />} />
        <Route
          path="create"
          element={
            <ProtectedRoute>
              <CreateListingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="listings/:id/edit"
          element={
            <ProtectedRoute>
              <CreateListingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute requireAdmin>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
