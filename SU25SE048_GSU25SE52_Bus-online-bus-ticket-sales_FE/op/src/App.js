import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './header/Header';
import RegisterForm from './API/register/Register';
import About from './about/About';
import Contact from './contact/Contact';
import ForgotPassword from './forgotPassword/ForgotPass';
import BusBooking from './layoutBanVe/BusSeatBooking';
import GoogleLoginButton from './googleLoginButton/GoogleLoginButton';
import HomePage from './home/HomePage';
import ManageRoute from './pages/manager/manageRoute/ManageRoute';
import LoginForm from './API/login/Login';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path='/' element={<LoginForm />} />
          <Route path='/register' element={<RegisterForm />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/forgotPass' element={<ForgotPassword />} />
          <Route path='/services' element={<BusBooking />} />
          <Route path='/home' element={<HomePage />} />
          <Route path='/loginGoogle' element={<GoogleLoginButton />} />
          <Route path='/manageRoute' element={<ManageRoute />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
export default App;
