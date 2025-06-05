import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RegisterForm from './API/register/Register';
import ForgotPassword from './API/forgotPassword/ForgotPass';
import BusBooking from './layoutBanVe/BusSeatBooking';
import GoogleLoginButton from './googleLoginButton/GoogleLoginButton';
import ManageRoute from './pages/manager/manageRoute/ManageRoute';
import LoginForm from './API/login/Login';
import ManageUsers from './pages/manager/manageUser/ManageUser';
import HomePage from './pages/admin/home/HomePage';
import About from './components/about/About';
import Contact from './components/contact/Contact';

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
          <Route path='/loginGoogle' element={<GoogleLoginButton />} />
          <Route path='/manageUser' element={<ManageUsers />} />
          <Route path='/manageRoute' element={<ManageRoute />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
export default App;
