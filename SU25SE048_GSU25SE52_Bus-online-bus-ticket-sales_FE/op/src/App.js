import './App.css';
import LoginForm from './login/Login';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './header/Header';
import RegisterForm from './register/Register';
import About from './about/About';
import Contact from './contact/Contact';
import ForgotPassword from './forgotPassword/ForgotPass';

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
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
