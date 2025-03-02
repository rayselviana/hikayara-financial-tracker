// src/components/Suggestions.jsx
import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import firebase from "../firebase";

function Suggestions() {
  const [suggestions, setSuggestions] = useState("");

  useEffect(() => {
    const fetchData = () => {
      try {
        const userId = firebase.auth.currentUser.uid;
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const transactionsRef = collection(firebase.db, `users/${userId}/transactions`);

        const q = query(transactionsRef, where("date", ">=", `${currentMonth}-01`), where("date", "<=", `${currentMonth}-31`));

        // Mendengarkan perubahan data secara real-time
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const expenses = snapshot.docs
            .filter((doc) => doc.data().type === "expense")
            .map((doc) => doc.data().amount);

          const incomes = snapshot.docs
            .filter((doc) => doc.data().type === "income")
            .map((doc) => doc.data().amount);

          const totalExpense = expenses.reduce((sum, amount) => sum + amount, 0);
          const totalIncome = incomes.reduce((sum, amount) => sum + amount, 0);

          const averageExpense = totalExpense / (expenses.length || 1);
          const averageIncome = totalIncome / (incomes.length || 1);

          // Rule-based prediction for savings and investments
          const savingsGoal = (totalIncome - totalExpense) * 0.2; // Save 20% of net income
          const investmentAmount = (totalIncome - totalExpense) * 0.1; // Invest 10% of net income

          const suggestion = `
            Berdasarkan pengeluaran dan pendapatan Anda:
            - Total Pendapatan Bulanan: Rp${totalIncome.toFixed(2)}
            - Total Pengeluaran Bulanan: Rp${totalExpense.toFixed(2)}
            - Rata-rata Pengeluaran Harian: Rp${averageExpense.toFixed(2)}
            - Rata-rata Pendapatan Harian: Rp${averageIncome.toFixed(2)}

            Saran Keuangan:
            - Tabungan bulanan yang direkomendasikan: Rp${savingsGoal.toFixed(2)} (20% dari pendapatan bersih)
            - Investasi bulanan yang direkomendasikan: Rp${investmentAmount.toFixed(2)} (10% dari pendapatan bersih)

            Rekomendasi Investasi:
            - Jika pendapatan bersih Anda stabil, pertimbangkan untuk berinvestasi di reksa dana saham (risiko sedang).
            - Jika Anda memiliki tujuan jangka panjang (5+ tahun), pertimbangkan untuk berinvestasi di properti atau saham.
          `;

          setSuggestions(suggestion);
        });

        // Membersihkan listener saat komponen di-unmount
        return () => unsubscribe();
      } catch (error) {
        console.error("Gagal mengambil data saran:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px", backgroundColor: "#121212", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)" }}>
      <h2 style={{ color: "#ffffff", marginBottom: "10px" }}>Saran Keuangan</h2>
      <pre style={{ whiteSpace: "pre-wrap", fontSize: "14px", color: "#ffffff", lineHeight: "1.5" }}>{suggestions}</pre>
    </div>
  );
}

export default Suggestions;