// src/components/Calendar.jsx
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import firebase from "../firebase";

function Calendar({ selectedDate, setSelectedDate }) {
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

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

  const handleDateClick = async (info) => {
    const selected = info.dateStr; // Format YYYY-MM-DD
    setSelectedDate(selected); // Kirim tanggal terpilih ke Dashboard

    try {
      const userId = firebase.auth.currentUser.uid;
      const transactionsRef = collection(firebase.db, `users/${userId}/transactions`);

      const q = query(transactionsRef, where("date", "==", selected));
      const snapshot = await getDocs(q);

      const transactionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log("Transaksi untuk tanggal:", selected, transactionsData); // Debugging
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Gagal mengambil data untuk tanggal:", error);
    }
  };

  return (
    <div>
      {/* Judul Kalender */}
      <h2>Kalender Transaksi</h2>

      {/* Kalender */}
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        dateClick={handleDateClick} // Pastikan ini ada
        events={transactions
          .slice(0, 3) // Batasi hanya 3 transaksi pertama
          .map((t) => ({
            title: `${t.type === "income" ? "+ Rp" : "- Rp"}${t.amount}`,
            date: t.date,
            backgroundColor: t.date === selectedDate ? "#FFD700" : "#378006" // Highlight kuning untuk tanggal terpilih
          }))}
        initialDate={selectedDate || undefined} // Lompat ke tanggal yang dipilih
      />
    </div>
  );
}

export default Calendar;