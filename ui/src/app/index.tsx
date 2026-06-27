import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout';
import ProtectedRoute from '../components/protected-route';
import ListingsPage from '../pages/listings';
import ListingDetailPage from '../pages/listing-detail';
import AboutPage from '../pages/about';
import CreateListingPage from '../pages/create-listing';
import ProfilePage from '../pages/profile';
import LoginPage from '../pages/login';
import RegisterPage from '../pages/register';
import AdminUsersPage from '../pages/admin-users';
import { paths } from '../routes';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ListingsPage />} />
        <Route path={paths.listingById} element={<ListingDetailPage />} />
        <Route path={paths.about} element={<AboutPage />} />
        <Route
          path={paths.create}
          element={
            <ProtectedRoute>
              <CreateListingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.editListing}
          element={
            <ProtectedRoute>
              <CreateListingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.profile}
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.adminUsers}
          element={
            <ProtectedRoute requireAdmin>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route path={paths.login} element={<LoginPage />} />
        <Route path={paths.register} element={<RegisterPage />} />
        <Route path={paths.any} element={<Navigate to={paths.root} replace />} />
      </Route>
    </Routes>
  );
}
