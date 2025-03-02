// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import firebase from "./firebase";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import Calendar from "./components/Calendar";
import Suggestions from "./components/Suggestions";
import TransactionDetails from "./components/TransactionDetails"; // Import halaman baru

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Mendengarkan perubahan status autentikasi pengguna
    const unsubscribe = firebase.auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Membersihkan listener saat komponen unmount
  }, []);

  return (
    <Router>
      <div>
        {/* Jika pengguna belum login, tampilkan halaman Auth */}
        {!user ? (
          <Auth />
        ) : (
          // Jika pengguna sudah login, tampilkan rute-rute aplikasi
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/suggestions" element={<Suggestions />} />
            <Route path="/transactions/:date" element={<TransactionDetails />} /> {/* Rute baru */}
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;