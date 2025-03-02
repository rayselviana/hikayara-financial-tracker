// src/components/Auth.jsx
import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import firebase from "../firebase";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(firebase.auth, email, password);
      } else {
        await signInWithEmailAndPassword(firebase.auth, email, password);
      }
      alert("Berhasil!");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h2>{isRegister ? "Daftar" : "Masuk"}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label>
          Kata Sandi:
          <input type="password" placeholder="Kata Sandi" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        <button type="submit">{isRegister ? "Daftar" : "Masuk"}</button>
      </form>

      <button onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar"}
      </button>
    </div>
  );
}

export default Auth;