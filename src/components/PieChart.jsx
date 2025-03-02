// src/components/PieChart.jsx
import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import firebase from "../firebase";

// Registrasi elemen yang diperlukan
ChartJS.register(ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

function PieChart() {
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      try {
        const userId = firebase.auth.currentUser.uid;
        const transactionsRef = collection(firebase.db, `users/${userId}/transactions`);

        // Query untuk pendapatan
        const incomeQuery = query(transactionsRef, where("type", "==", "income"));

        // Query untuk pengeluaran
        const expenseQuery = query(transactionsRef, where("type", "==", "expense"));

        // Mendengarkan perubahan data secara real-time
        const unsubscribeIncome = onSnapshot(incomeQuery, (snapshot) => {
          let totalIncome = 0;
          snapshot.forEach((doc) => (totalIncome += doc.data().amount));
          setIncome(totalIncome);
        });

        const unsubscribeExpense = onSnapshot(expenseQuery, (snapshot) => {
          let totalExpense = 0;
          snapshot.forEach((doc) => (totalExpense += doc.data().amount));
          setExpense(totalExpense);
        });

        setLoading(false); // Set loading ke false setelah data dimuat

        return () => {
          unsubscribeIncome();
          unsubscribeExpense();
        };
      } catch (error) {
        console.error("Gagal mengambil data untuk grafik:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p>Memuat data...</p>;
  }

  if (income === 0 && expense === 0) {
    return <p>Tidak ada data yang tersedia untuk grafik.</p>;
  }

  const data = {
    labels: ["Pendapatan", "Pengeluaran"],
    datasets: [
      {
        data: [income, expense],
        backgroundColor: ["#4CAF50", "#F44336"],
        hoverBackgroundColor: ["#45A049", "#E53935"]
      }
    ]
  };

  return (
    <div style={{ width: "300px", margin: "20px auto" }}>
      <h3>Pendapatan vs Pengeluaran</h3>
      <Pie data={data} />
    </div>
  );
}

export default PieChart;