import { useState } from "react"
import { signIn, signUp, signInWithGoogle } from "../lib/auth"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    const { error } = await signIn(email, password)
    if (error) alert(error.message)
  }

  const handleGoogle = async () => {
  const { error } = await signInWithGoogle()
  if (error) alert(error.message)
}

  return (
    <div style={{ padding: 20 }}>
      <h2>RiskPilot Login</h2>

      <input
        placeholder="email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
      <button onClick={handleSignup}>Sign Up</button>
    </div>
  )
}
