import { Routes, Route } from 'react-router-dom';

// Layout
import Layout from './components/Layout/Layout';

// Pages
import Home from './pages/Home';
import NotFound from './pages/NotFound';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// User Pages
import UserDashboard from './pages/User/Dashboard';
import CarDetails from './pages/User/CarDetails';
import Booking from './pages/User/Booking';
import Payment from './pages/User/Payment'
import PaymentTest from './pages/User/PaymentTest';
import BookingSuccess from './pages/User/BookingSuccess';
import MyBookings from './pages/User/MyBookings';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminCars from './pages/Admin/Cars';
import NewCar from './pages/Admin/NewCar';
import ApiTestPage from './pages/Admin/ApiTestPage';

// Route Guards
import ProtectedRoute from './components/Routes/ProtectedRoute';
import AdminRoute from './components/Routes/AdminRoute';

function App() {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Routes */}
        <Route path="/user/dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/user/cars" element={
          <ProtectedRoute>
            <CarDetails />
          </ProtectedRoute>
        } />
        <Route path="/user/cars/:id" element={
          <ProtectedRoute>
            <CarDetails />
          </ProtectedRoute>
        } />
        <Route path="/user/booking/:id" element={
          <ProtectedRoute>
            <Booking />
          </ProtectedRoute>
        } />
        <Route path="/user/payment/:id" element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } />
        <Route path="/user/payment" element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } />
        <Route path="/user/payment-test" element={
          <ProtectedRoute>
            <PaymentTest />
          </ProtectedRoute>
        } />
        <Route path="/user/booking-success/:id" element={
          <ProtectedRoute>
            <BookingSuccess />
          </ProtectedRoute>
        } />
        <Route path="/user/my-bookings" element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/cars" element={
          <AdminRoute>
            <AdminCars />
          </AdminRoute>
        } />
        <Route path="/admin/cars/new" element={
          <AdminRoute>
            <NewCar />
          </AdminRoute>
        } />
        <Route path="/admin/cars/edit/:id" element={
          <AdminRoute>
            <NewCar />
          </AdminRoute>
        } />
        <Route path="/admin/api-test" element={
          <AdminRoute>
            <ApiTestPage />
          </AdminRoute>
        } />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default App;