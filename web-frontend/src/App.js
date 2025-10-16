import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import ChefDashboard from './pages/ChefDashboard';
import PrivateRoute from './routes/PrivateRoute';
import RedirectAuthenticatedUser from './routes/RedirectAuthenticatedUser';
import ActivationFailed from './pages/ActivationFailed';
import ActivationPending from './pages/ActivationPending';
import ActivationSuccess from './pages/ActivationSuccess';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={
          <RedirectAuthenticatedUser>
            <Login />
          </RedirectAuthenticatedUser>
        } />
        <Route path="/activation-pending" element={<ActivationPending />} />
        <Route path="/activation-success" element={<ActivationSuccess />} />
        <Route path="/activation-failed" element={<ActivationFailed />} />
        <Route path='/customer-dashboard' element={
          <PrivateRoute requiredRole='customer'>
            <CustomerDashboard />
          </PrivateRoute>
        } />
        <Route path='/chef-dashboard' element={
          <PrivateRoute requiredRole='chef'>
            <ChefDashboard />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
