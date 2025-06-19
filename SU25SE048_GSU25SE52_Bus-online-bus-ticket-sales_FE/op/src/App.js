import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RegisterForm from './services/register/Register';
import ManageRoute from './pages/manager/manageRoute/ManageRoute';
import LoginForm from './services/login/Login';
import HomePage from './pages/admin/home/HomePage';
import About from './components/about/About';
import Contact from './components/contact/Contact';
import CreateTrip from './pages/manager/createTrip/CreateTrip';
import BusBooking from './pages/manager/layoutBanVe/BusSeatBooking';
import ForgotPassword from './services/forgotPassword/ForgotPass';
import ManageUsers from './pages/manager/manageUser/ManageUser';
import CompanyManagement from './pages/manager/manageCompany/ManageCompany';
import TicketBooking from './pages/customer/bookTicket/BookTicket';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LoginForm />} />
          <Route path='/register' element={<RegisterForm />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/services' element={<BusBooking />} />
          <Route path='/home' element={<HomePage />} />
          <Route path='/forgotPass' element={<ForgotPassword />} />
          <Route path='/manage-route' element={<ManageRoute />} />
          <Route path='/manager' element={<CreateTrip />} />
          <Route path='/manageUser' element={<ManageUsers />} />
          <Route path='/manage' element={<CompanyManagement />} />
          <Route path='/bookTicket' element={<TicketBooking />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
export default App;
