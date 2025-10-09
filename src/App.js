import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import Spinner from "./components/Spinner";
import { useSelector } from "react-redux";
import BarberForm from "./pages/BarberForm";
import Admin from "./pages/Admin";
import BookAppointment from "./pages/BookAppointment";
import Welcome from "./pages/Welcome";
import About from "./pages/About";

function App() {
  const { loading } = useSelector((state) => state.loader);

  return (
    <div>
      {loading && <Spinner />}
      <BrowserRouter>
        <Routes>
          {/* Javne strani */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Zaščitene strani */}
          <Route
            path="/"
            element={
              !localStorage.getItem("user") ? (
                <Login />
              ) : (
                <ProtectedRoute>
                  <Welcome />
                </ProtectedRoute>
              )
            }
          />
          <Route
            path="/barbers"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book-appointment/:id"
            element={
              <ProtectedRoute>
                <BookAppointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/apply-barber"
            element={
              <ProtectedRoute>
                <BarberForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
