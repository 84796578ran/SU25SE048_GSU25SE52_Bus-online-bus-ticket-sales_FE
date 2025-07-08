import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RegisterForm from './services/register/Register';
import ManageRoute from './pages/manager/manageRoute/ManageRoute';
import LoginForm from './services/login/Login';
import About from './components/about/About';
import Contact from './components/contact/Contact';
import CreateTrip from './pages/manager/createTrip/CreateTrip';
import BusBooking from './pages/manager/layoutBanVe/BusSeatBooking';
import ForgotPassword from './services/forgotPassword/ForgotPass';
import ManageUsers from './pages/manager/manageUser/ManageUser';
import TicketBooking from './pages/customer/bookTicket/BookTicket';
import SearchTicket from './pages/customer/searchTicket/SearchTicket';
import SearchTrip from './pages/customer/searchTrip/SearchTrip';
import LocationManagement from './pages/admin/manageLocation/ManageLocation';
import StationManagement from './pages/admin/manageStation/ManageStation';
import SearchResultsPage from './pages/customer/searchTrip/SearchResultsPage';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<LoginForm />} />
          <Route path='/register' element={<RegisterForm />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/services' element={<BusBooking />} />
          <Route path='/' element={<SearchTrip />} />
          <Route path='/forgotPass' element={<ForgotPassword />} />
          <Route path='/manage-route' element={<ManageRoute />} />
          <Route path='/manager' element={<CreateTrip />} />
          <Route path='/manageUser' element={<ManageUsers />} />
          <Route path='/manageLocation' element={<LocationManagement />} />
          <Route path='/manageStation' element={<StationManagement />} />
          <Route path='/bookTicket' element={<TicketBooking />} />
          <Route path='/search-results' element={<SearchResultsPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
export default App;
