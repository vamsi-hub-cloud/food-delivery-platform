import { useState } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAdmin } from '../context/AdminContext'

const DEMO = [
  ['Super Admin', 'admin@foodigo.com', 'admin123'],
  ['Operations Manager', 'ops@foodigo.com', 'ops123'],
  ['Finance Manager', 'finance@foodigo.com', 'finance123'],
]

export default function AdminLogin() {
  const { login, user } = useAdmin()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [show, setShow] = useState(false)
  if (user) return <Navigate to="/admin" replace />

  const submit = (e) => {
    e.preventDefault()
    const er = {}
    if (!email.trim()) er.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) er.email = 'Enter a valid email'
    if (!password) er.password = 'Password is required'
    if (!Object.keys(er).length) { const r = login(email, password); if (!r.ok) er.form = r.message; else return nav('/admin', { replace: true }) }
    setErrors(er)
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-gradient-to-br from-[#1b1f2b] via-[#2a1f3d] to-[#3b1d2e] p-4">
      <span className="absolute -left-10 top-10 animate-float text-9xl opacity-10">🍕</span>
      <span className="absolute -right-6 bottom-10 animate-float-slow text-9xl opacity-10">🍔</span>
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-pink-500 text-3xl shadow-lift">🍔</span>
          <h1 className="mt-3 text-2xl font-extrabold">FoodiGo Admin</h1>
          <p className="text-sm text-gray-500">Sign in to manage the platform</p>
        </div>
        <form onSubmit={submit} noValidate className="mt-6 space-y-4">
          {errors.form && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600" role="alert">{errors.form}</p>}
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" placeholder="admin@foodigo.com" className={`input ${errors.email ? 'input-error' : ''}`} />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <div className="relative">
              <input id="password" value={password} onChange={(e) => setPassword(e.target.value)} type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" className={`input pr-12 ${errors.password ? 'input-error' : ''}`} />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">{show ? 'Hide' : 'Show'}</button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>
          <button className="btn-primary btn-shine w-full !py-3">Sign in</button>
        </form>
        <div className="mt-6 rounded-2xl bg-orange-50 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-700">Demo accounts (click to fill)</p>
          <div className="space-y-1.5">
            {DEMO.map(([r, e, p]) => (
              <button key={e} type="button" onClick={() => { setEmail(e); setPassword(p); setErrors({}) }} className="flex w-full items-center justify-between rounded-lg bg-white px-3 py-2 text-left text-xs shadow-sm transition hover:shadow">
                <span className="font-semibold">{r}</span><span className="text-gray-400">{e}</span>
              </button>
            ))}
          </div>
        </div>
        <Link to="/" className="mt-4 block text-center text-sm text-gray-500 hover:text-brand-600">← Back to customer site</Link>
      </motion.div>
    </div>
  )
}
