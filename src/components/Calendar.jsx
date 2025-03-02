// src/components/Calendar.jsx
import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import firebase from "../firebase";

function Calendar({ selectedDate, setSelectedDate }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      try {
        const userId = firebase.auth.currentUser.uid;
        const transactionsRef = collection(firebase.db, `users/${userId}/transactions`);

        // Mendengarkan perubahan data secara real-time
        const unsubscribe = onSnapshot(transactionsRef, (snapshot) => {
          const transactionsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));

          console.log("Data transaksi untuk kalender:", transactionsData); // Debugging
          setTransactions(transactionsData);
        });

        return () => unsubscribe(); // Membersihkan listener saat komponen unmount
      } catch (error) {
        console.error("Gagal mengambil data untuk kalender:", error);
      }
    };

    fetchData();
  }, []);

  // Fungsi untuk mendapatkan total pengeluaran pada tanggal tertentu
  const getTotalExpenseForDate = (date) => {
    const expenses = transactions
      .filter((transaction) => transaction.date === date && transaction.type === "expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return expenses;
  };

  // Fungsi untuk menentukan warna berdasarkan logika sugesti
  const getDateColor = (date) => {
    const totalExpense = getTotalExpenseForDate(date);
    if (totalExpense > 500000) {
      return "#dc3545"; // Merah (pengeluaran tinggi)
    } else if (totalExpense > 0) {
      return "#28a745"; // Hijau (pengeluaran OK)
    } else {
      return "#333333"; // Abu-abu (tidak ada transaksi)
    }
  };

  // Render Kalender
  const renderCalendar = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "5px" }}>
        {/* Header Hari */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} style={{ color: "#ffffff", textAlign: "center", fontWeight: "bold" }}>
            {day}
          </div>
        ))}

        {/* Isi Kalender */}
        {Array.from({ length: 35 }, (_, index) => {
          const currentDate = new Date(today.getFullYear(), today.getMonth(), index + 1 - startDay);
          const isCurrentMonth = currentDate.getMonth() === today.getMonth();
          const isToday = currentDate.toISOString().slice(0, 10) === today.toISOString().slice(0, 10);
          const formattedDate = currentDate.toISOString().slice(0, 10); // Format YYYY-MM-DD
          const dateColor = getDateColor(formattedDate);

          return (
            <div
              key={index}
              onClick={() => setSelectedDate(formattedDate)} // Pastikan tanggal yang diklik sesuai
              style={{
                padding: "10px",
                backgroundColor: isToday ? "#007bff" : dateColor,
                color: isToday || dateColor !== "#333333" ? "#ffffff" : "#cccccc",
                textAlign: "center",
                cursor: "pointer",
                borderRadius: "5px",
                opacity: isCurrentMonth ? 1 : 0.5
              }}
            >
              {currentDate.getDate()}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#121212", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)" }}>
      <h2 style={{ color: "#ffffff", marginBottom: "10px" }}>Kalender Transaksi</h2>

      {/* Kalender */}
      {renderCalendar()}
    </div>
  );
}

export default Calendar;
