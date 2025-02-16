import React, { useState } from 'react';
import { FaFacebookF, FaGooglePlusG, FaLinkedinIn } from "react-icons/fa";
import './login.css';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="wrapper">
      <div className={`container ${isSignUp ? 'right-panel-active' : ''}`}>
        <div className="form-container sign-up-container">
          <form>
            <h1>Create Account</h1>
            <div className="social-container">
      <a href="#" className="social"><FaFacebookF /></a>
      <a href="#" className="social"><FaGooglePlusG /></a>
      <a href="#" className="social"><FaLinkedinIn /></a>
    </div>
            <span>Hoặc sử dụng Email để hoàn tất đăng kí</span>
            <input type="text" placeholder="Name" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button type="button">Đăng kí</button>
          </form>
        </div>
        <div className="form-container sign-in-container">
          <form>
            <h1>Đăng nhập</h1>
            <div className="social-container">
      <a href="#" className="social"><FaFacebookF /></a>
      <a href="#" className="social"><FaGooglePlusG /></a>
      <a href="#" className="social"><FaLinkedinIn /></a>
    </div>
            <span>Hoặc đăng nhập bằng tài khoản của quý khách</span>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <a href="#">Quên mật khẩu?</a>
            <button type="button">Đăng nhập</button>
          </form>
        </div>
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Chào Mừng Quý Khách!</h1>
              <p>Để được hưởng quyền lợi thành viên, mời quý khách đăng nhập</p>
              <button className="ghost" onClick={() => setIsSignUp(false)}>Đăng nhập</button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Chào Mừng Quý Khách!</h1>
              <p>Đăng kí để được hưởng đặc quyền thành viên.</p>
              <button className="ghost" onClick={() => setIsSignUp(true)}>Đăng Kí</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
