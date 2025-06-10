import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RegisterForm from './register/Register';
import ForgotPassword from './forgotPassword/ForgotPass';
import ManageRoute from './pages/manager/manageRoute/ManageRoute';
import LoginForm from './login/Login';
import ManageUsers from './pages/manager/manageUser/ManageUser';
import HomePage from './pages/admin/home/HomePage';
import About from './components/about/About';
import Contact from './components/contact/Contact';
import CreateTrip from './pages/manager/createTrip/CreateTrip';
import BusBooking from './layoutBanVe/BusSeatBooking';
import PopularRoutes from './pages/admin/home/PopularRoutes';
import PromotionBanner from './pages/admin/home/PromotionBanner';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LoginForm />} />
          <Route path='/register' element={<RegisterForm />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/forgotPass' element={<ForgotPassword />} />
          <Route path='/services' element={<BusBooking />} />
          <Route path='/home' element={<HomePage />} />
          <Route path='/manageUser' element={<ManageUsers />} />
          <Route path='/manageRoute' element={<ManageRoute />} />
          <Route path='/manageBus' element={<CreateTrip />} />
          <Route path='/PopularRoutes' element={<PopularRoutes />} />
          <Route path='/PromotionBanner' element={<PromotionBanner />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
export default App;
