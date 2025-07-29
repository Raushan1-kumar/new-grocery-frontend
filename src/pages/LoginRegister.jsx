import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const INITIAL_REGISTER = {
  name: '',
  address: '',
  number: '',
  email: '',
  password: ''
};

const INITIAL_LOGIN = {
  email: '',
  password: ''
};

export default function LoginRegister() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [login, setLogin] = useState({ ...INITIAL_LOGIN });
  const [register, setRegister] = useState({ ...INITIAL_REGISTER });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleMode = (newMode) => {
    setMode(newMode);
    setFormError('');
    setSuccessMsg('');
    setLoading(false);
    // Optionally reset fields:
    // setLogin({ ...INITIAL_LOGIN }); setRegister({ ...INITIAL_REGISTER });
  };

  // Universal input handler
  const handleInput = (e, type) => {
    const { name, value } = e.target;
    if (type === 'login') setLogin((p) => ({ ...p, [name]: value }));
    else setRegister((p) => ({ ...p, [name]: value }));
  };

    const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');
    setLoading(true);
    const url =
      mode === 'login'
        ? 'https://new-grocery-backend-uwyb.onrender.com/api/users/login'
        : 'https://new-grocery-backend-uwyb.onrender.com/api/users/register';
    const body =
      mode === 'login'
        ? login
        : register;

    // Validate required fields
    if (mode === 'login' && (!login.email || !login.password)) {
      setFormError('Email and password required');
      setLoading(false);
      return;
    }
    if (
      mode === 'register' &&
      (!register.name ||
       !register.email ||
       !register.password ||
       !register.number ||
       !register.address)
    ) {
      setFormError('All fields required');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.message || 'Error');
      } else {
        // Admin login shortcut (frontend only, not secure)
        if (
          mode === 'login' &&
          login.email === 'admin@gmail.com' &&
          login.password === 'admin12345'
        ) {
          if (data.token) {
            localStorage.setItem('admintoken', data.token);
          }
          setSuccessMsg('Admin login successful!');
          navigate('/admin-dashboard');
        }
        else if (
          mode === 'login' &&
          login.email === 'staff@gmail.com' &&
          login.password === 'staff12345'
        ) {
          if (data.token) {
            localStorage.setItem('stafftoken', data.token);
            localStorage.setItem('token', data.token);
          }
          setSuccessMsg('staff login successful!');
          navigate('/home');
        }
        else {
          if (mode === 'login') {
            setSuccessMsg('Login successful! Redirecting...');
            if (data.token) {
              localStorage.setItem('token', data.token);
            }
            navigate('/profile');
          } else {
            setSuccessMsg('Registration successful! Please log in.');
            if (data.token) {
              localStorage.setItem('token', data.token);
            }
            setMode('login');
          }
        }
      }
    } catch (err) {
      setFormError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <div className="w-full max-w-md px-6 py-8 bg-white shadow-lg rounded-lg">
        <div className="flex justify-center mb-8">
          <button
            className={`px-4 py-2 rounded-l-lg font-semibold transition-all ${
              mode === 'login'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-yellow-900'
            }`}
            onClick={() => handleMode('login')}
            disabled={loading}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 rounded-r-lg font-semibold transition-all ${
              mode === 'register'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-yellow-900'
            }`}
            onClick={() => handleMode('register')}
            disabled={loading}
          >
            Register
          </button>
        </div>
        {formError && (
          <div className="mb-3 text-red-500 text-sm text-center">{formError}</div>
        )}
        {successMsg && (
          <div className="mb-3 text-yellow-500 text-sm text-center">{successMsg}</div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={register.name}
                  onChange={(e) => handleInput(e, 'register')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter your name"
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={register.address}
                  onChange={(e) => handleInput(e, 'register')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter your address"
                  autoComplete="street-address"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Mobile Number</label>
                <input
                  type="text"
                  name="number"
                  value={register.number}
                  onChange={(e) => handleInput(e, 'register')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter your mobile number"
                  autoComplete="tel"
                  disabled={loading}
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-bold mb-1 text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={mode === 'login' ? login.email : register.email}
              onChange={(e) =>
                mode === 'login'
                  ? handleInput(e, 'login')
                  : handleInput(e, 'register')
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={mode === 'login' ? login.password : register.password}
              onChange={(e) =>
                mode === 'login'
                  ? handleInput(e, 'login')
                  : handleInput(e, 'register')
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className={`w-full mt-2 py-2 rounded-md text-white font-semibold ${
              loading ? 'bg-yellow-300' : 'bg-yellow-600 hover:bg-yellow-700'
            } transition`}
            disabled={loading}
          >
            {loading
              ? mode === 'login'
                ? 'Logging in...'
                : 'Registering...'
              : mode === 'login'
              ? 'Login'
              : 'Register'}
          </button>
        </form>
      </div>
    </div>
  )

}