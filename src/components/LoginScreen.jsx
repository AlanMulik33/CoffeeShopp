import { useState } from 'react'
import { usePosStore } from '../store/posStore'

function LoginScreen() {
  const loginUser = usePosStore((state) => state.loginUser)
  const loginError = usePosStore((state) => state.loginError)
  const clearLoginError = usePosStore((state) => state.clearLoginError)
  const addToast = usePosStore((state) => state.addToast)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    const success = loginUser(username, password)

    if (success) {
      addToast({
        title: 'Login berhasil',
        message: 'Selamat datang di Warm Brew POS.',
        type: 'success',
      })
    }
  }

  const quickLogin = (demoUsername, demoPassword) => {
    setUsername(demoUsername)
    setPassword(demoPassword)

    const success = loginUser(demoUsername, demoPassword)

    if (success) {
      addToast({
        title: 'Login demo berhasil',
        message: `Masuk sebagai ${demoUsername}.`,
        type: 'success',
      })
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7efe5] p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-[#ead8c0] bg-white shadow-2xl lg:grid-cols-[1fr_420px]">
        <div className="relative hidden bg-[#2d1810] p-10 text-white lg:block">
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,_#d8b98f,_transparent_35%),radial-gradient(circle_at_bottom_right,_#b88746,_transparent_35%)]" />
          </div>

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#d8b98f]">
                Warm Brew POS
              </p>

              <h1 className="mt-6 text-5xl font-black leading-tight">
                Coffee Shop Cashier System
              </h1>

              <p className="mt-5 max-w-md text-lg leading-relaxed text-[#f8ead8]">
                Login sesuai role untuk mengakses fitur kasir, barista, produk,
                stok, restock, dan dashboard.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="font-bold text-[#d8b98f]">Role demo</p>
              <div className="mt-3 space-y-2 text-sm text-[#f8ead8]">
                <p>Admin: semua fitur</p>
                <p>Kasir: POS dan riwayat order</p>
                <p>Barista: kitchen display</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#b88746]">
              Login
            </p>

            <h2 className="mt-2 text-4xl font-black text-[#2d1810]">
              Masuk Sistem
            </h2>

            <p className="mt-2 text-sm text-[#7b5d4a]">
              Gunakan akun demo sesuai role.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#2d1810]">
                Username
              </label>

              <input
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value)
                  clearLoginError()
                }}
                placeholder="admin"
                className="w-full rounded-2xl border border-[#ead8c0] bg-[#fffaf3] px-5 py-4 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#2d1810]">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  clearLoginError()
                }}
                placeholder="admin123"
                className="w-full rounded-2xl border border-[#ead8c0] bg-[#fffaf3] px-5 py-4 text-[#2d1810] outline-none focus:border-[#b88746] focus:ring-4 focus:ring-[#ead8c0]"
              />
            </div>

            {loginError && (
              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-sm font-bold text-red-500">
                  {loginError}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#6f3f24] px-5 py-4 font-bold text-white hover:bg-[#4b2818]"
            >
              Login
            </button>
          </form>

          <div className="mt-8 rounded-3xl border border-[#ead8c0] bg-[#fffaf3] p-5">
            <p className="text-sm font-bold text-[#2d1810]">
              Quick Login Demo
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                onClick={() => quickLogin('admin', 'admin123')}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#6f3f24] hover:bg-[#fff4e7]"
              >
                Admin
              </button>

              <button
                onClick={() => quickLogin('kasir', 'kasir123')}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#6f3f24] hover:bg-[#fff4e7]"
              >
                Kasir
              </button>

              <button
                onClick={() => quickLogin('barista', 'barista123')}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#6f3f24] hover:bg-[#fff4e7]"
              >
                Barista
              </button>
            </div>
          </div>

          <div className="mt-5 text-xs text-[#7b5d4a]">
            <p>Admin: admin / admin123</p>
            <p>Kasir: kasir / kasir123</p>
            <p>Barista: barista / barista123</p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default LoginScreen