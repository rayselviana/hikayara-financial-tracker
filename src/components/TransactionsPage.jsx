// src/components/TransactionsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import firebase from "../firebase";

function TransactionsPage() {
  const { date } = useParams(); // Ambil tanggal dari URL
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const userId = firebase.auth.currentUser.uid;
        const transactionsRef = collection(firebase.db, `users/${userId}/transactions`);

        const q = query(transactionsRef, where("date", "==", date));
        const snapshot = await getDocs(q);

        const transactionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        setTransactions(transactionsData);
      } catch (error) {
        console.error("Gagal mengambil data transaksi:", error);
      }
    };

    fetchTransactions();
  }, [date]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Daftar Transaksi pada {date}</h2>
      {transactions.length > 0 ? (
        <ul>
          {transactions.map((t) => (
            <li key={t.id}>
              {t.type === "income" ? "+ Rp" : "- Rp"}
              {t.amount} ({t.category})
            </li>
          ))}
        </ul>
      ) : (
        <p>Tidak ada transaksi pada tanggal ini.</p>
      )}
    </div>
  );
}

export default TransactionsPage;