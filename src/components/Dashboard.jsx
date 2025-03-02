// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // Impor useNavigate
import firebase from "../firebase";
import PieChart from "./PieChart";
import Calendar from "./Calendar"; // Impor komponen Calendar
import Suggestions from "./Suggestions"; // Impor komponen Suggestions

function Dashboard() {
  const navigate = useNavigate(); // Gunakan useNavigate untuk navigasi
  const [incomeDaily, setIncomeDaily] = useState(0); // Pendapatan harian
  const [expenseDaily, setExpenseDaily] = useState(0); // Pengeluaran harian
  const [incomeMonthly, setIncomeMonthly] = useState(0); // Pendapatan bulanan
  const [expenseMonthly, setExpenseMonthly] = useState(0); // Pengeluaran bulanan
  const [formData, setFormData] = useState({
    type: "income",
    amount: "",
    category: "",
    date: new Date().toISOString().slice(0, 10) // Default hari ini
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10)); // Default hari ini
  const [transactions, setTransactions] = useState([]); // Transaksi pada tanggal terpilih

  useEffect(() => {
    const fetchData = () => {
      try {
        const userId = firebase.auth.currentUser.uid;
        const transactionsRef = collection(firebase.db, `users/${userId}/transactions`);

        // Filter data berdasarkan tanggal terpilih (harian)
        const dailyQueryIncome = query(
          transactionsRef,
          where("type", "==", "income"),
          where("date", "==", selectedDate)
        );
        const dailyQueryExpense = query(
          transactionsRef,
          where("type", "==", "expense"),
          where("date", "==", selectedDate)
        );

        // Filter data berdasarkan bulan terpilih (bulanan)
        const currentMonth = selectedDate.slice(0, 7); // YYYY-MM
        const monthlyQueryIncome = query(
          transactionsRef,
          where("type", "==", "income"),
          where("date", ">=", `${currentMonth}-01`),
          where("date", "<=", `${currentMonth}-31`)
        );
        const monthlyQueryExpense = query(
          transactionsRef,
          where("type", "==", "expense"),
          where("date", ">=", `${currentMonth}-01`),
          where("date", "<=", `${currentMonth}-31`)
        );

        // Mendengarkan perubahan data secara real-time
        const unsubscribeDailyIncome = onSnapshot(dailyQueryIncome, (snapshot) => {
          let totalIncome = 0;
          snapshot.forEach((doc) => (totalIncome += doc.data().amount));
          setIncomeDaily(totalIncome);
        });

        const unsubscribeDailyExpense = onSnapshot(dailyQueryExpense, (snapshot) => {
          let totalExpense = 0;
          snapshot.forEach((doc) => (totalExpense += doc.data().amount));
          setExpenseDaily(totalExpense);
        });

        const unsubscribeMonthlyIncome = onSnapshot(monthlyQueryIncome, (snapshot) => {
          let totalIncome = 0;
          snapshot.forEach((doc) => (totalIncome += doc.data().amount));
          setIncomeMonthly(totalIncome);
        });

        const unsubscribeMonthlyExpense = onSnapshot(monthlyQueryExpense, (snapshot) => {
          let totalExpense = 0;
          snapshot.forEach((doc) => (totalExpense += doc.data().amount));
          setExpenseMonthly(totalExpense);
        });

        return () => {
          unsubscribeDailyIncome();
          unsubscribeDailyExpense();
          unsubscribeMonthlyIncome();
          unsubscribeMonthlyExpense();
        };
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      }
    };

    fetchData();
  }, [selectedDate]); // Jalankan ulang saat tanggal terpilih berubah

  useEffect(() => {
  const fetchTransactions = () => {
    try {
      const userId = firebase.auth.currentUser.uid;
      const transactionsRef = collection(firebase.db, `users/${userId}/transactions`);

      const q = query(
        transactionsRef,
        where("date", "==", selectedDate),
        orderBy("timestamp", "desc") // Urutkan berdasarkan timestamp (terbaru ke terlama)
      );

      // Mendengarkan perubahan data secara real-time
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const transactionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log("Transaksi untuk tanggal:", selectedDate, transactionsData); // Debugging
        setTransactions(transactionsData);
      });

      return () => unsubscribe(); // Membersihkan listener saat komponen unmount
    } catch (error) {
      console.error("Gagal mengambil data transaksi:", error);
    }
  };

  fetchTransactions();
}, [selectedDate]); // Jalankan ulang saat tanggal terpilih berubah

    fetchTransactions();
  }, [selectedDate]); // Jalankan ulang saat tanggal terpilih berubah

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = firebase.auth.currentUser.uid;
      const transactionsRef = collection(firebase.db, `users/${userId}/transactions`);

      await addDoc(transactionsRef, {
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date
      });

      alert("Transaksi berhasil ditambahkan!");
      setFormData({ type: "income", amount: "", category: "", date: new Date().toISOString().slice(0, 10) });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      const userId = firebase.auth.currentUser.uid;
      const transactionRef = doc(firebase.db, `users/${userId}/transactions`, id);
      await deleteDoc(transactionRef);

      alert("Transaksi berhasil dihapus!");
      setTransactions(transactions.filter((t) => t.id !== id)); // Hapus transaksi dari state lokal
    } catch (error) {
      console.error("Gagal menghapus transaksi:", error);
    }
  };

  const handleDeleteAllTransactions = async () => {
    try {
      const userId = firebase.auth.currentUser.uid;
      const transactionsRef = collection(firebase.db, `users/${userId}/transactions`);
      const q = query(transactionsRef, where("date", "==", selectedDate));
      const snapshot = await getDocs(q);

      snapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      alert("Semua transaksi pada tanggal ini berhasil dihapus!");
      setTransactions([]); // Kosongkan state lokal
    } catch (error) {
      console.error("Gagal menghapus semua transaksi:", error);
    }
  };

  const currentMonth = selectedDate.slice(0, 7); // YYYY-MM
  const monthName = new Date(currentMonth).toLocaleString("default", { month: "long" });
  const year = new Date(currentMonth).getFullYear();

  return (
    <div style={{ padding: "20px" }}>
      {/* Judul Utama */}
      <h2>Hikayara Financial Tracker</h2>

      {/* Form Input */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <label>
          Jenis Transaksi:
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="income">Pendapatan</option>
            <option value="expense">Pengeluaran</option>
          </select>
        </label>

        <label>
          Jumlah:
          <input type="number" name="amount" value={formData.amount} onChange={handleChange} required />
        </label>

        <label>
          Kategori:
          <input type="text" name="category" value={formData.category} onChange={handleChange} required />
        </label>

        <label>
          Tanggal:
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        </label>

        <button type="submit">Tambah Transaksi</button>
      </form>

      {/* Pilihan Tanggal */}
      <div style={{ marginTop: "20px" }}>
        <label>
          Pilih Tanggal untuk Melihat Data:
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </label>
      </div>

      {/* Statistik Keuangan Harian */}
      <div style={{ marginTop: "20px" }}>
        <h3>Data Harian ({selectedDate})</h3>
        <p>Total Pendapatan: Rp{incomeDaily}</p>
        <p>Total Pengeluaran: Rp{expenseDaily}</p>
        <p>Saldo: Rp{incomeDaily - expenseDaily}</p>
      </div>

      {/* Statistik Keuangan Bulanan */}
      <div style={{ marginTop: "20px" }}>
        <h3>Data Bulanan ({monthName} {year})</h3>
        <p>Total Pendapatan: Rp{incomeMonthly}</p>
        <p>Total Pengeluaran: Rp{expenseMonthly}</p>
        <p>Saldo: Rp{incomeMonthly - expenseMonthly}</p>
      </div>

      {/* Grafik Visualisasi */}
      <PieChart income={incomeMonthly} expense={expenseMonthly} />

      {/* Kalender */}
      <div style={{ marginTop: "20px" }}>
        <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      </div>

      {/* Daftar Transaksi untuk Tanggal Terpilih */}
      {selectedDate && (
        <div style={{ marginTop: "20px" }}>
          <h3>Transaksi pada {selectedDate}</h3>
          <p>Mohon muat ulang/refresh halaman setiap Anda menginput transaksi. </p>
          {transactions.length > 0 ? (
            <>
              <ul>
                {transactions.slice(0, 3).map((t) => (
                  <li key={t.id}>
                    {t.type === "income" ? "+ Rp" : "- Rp"}
                    {t.amount} ({t.category}){" "}
                    <button onClick={() => handleDeleteTransaction(t.id)}>Hapus</button>
                  </li>
                ))}
              </ul>
              {transactions.length > 3 && (
                <button onClick={() => navigate(`/transactions/${selectedDate}`)}>
                  Lihat lebih banyak...
                </button>
              )}
            </>
          ) : (
            <p>Tidak ada transaksi pada tanggal ini.</p>
          )}
          {transactions.length > 0 && (
            <button onClick={handleDeleteAllTransactions}>Hapus Semua Transaksi pada Tanggal Ini</button>
          )}
        </div>
      )}

      {/* Saran Keuangan */}
      <div style={{ marginTop: "20px" }}>
        <Suggestions />
      </div>

      {/* Tombol Logout */}
      <button onClick={() => firebase.auth.signOut()}>Keluar</button>
    </div>
  );
}

export default Dashboard;
