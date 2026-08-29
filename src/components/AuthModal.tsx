import React, { useState } from 'react';
import { 
  X, 
  User, 
  LogIn, 
  UserPlus, 
  LogOut, 
  ShieldCheck, 
  Cloud, 
  Smartphone, 
  Laptop, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  googleProvider,
  signOut
} from '../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FirebaseUser | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
      setSuccessMessage('Berhasil masuk dengan Google! Data tersinkronkan.');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.warn('Google sign-in status:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Jendela login Google ditutup.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignored
      } else {
        setErrorMessage(err.message || 'Gagal masuk dengan akun Google.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccessMessage('Akun berhasil dibuat dan disinkronkan ke cloud!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccessMessage('Berhasil masuk! Data Anda disinkronkan secara real-time.');
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.warn('Auth error:', err);
      let msg = err.message || 'Terjadi kesalahan otentikasi.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Email atau password salah.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Email ini sudah terdaftar. Silakan login.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password minimal 6 karakter.';
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setSuccessMessage('Berhasil keluar dari akun.');
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal keluar akun.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <Cloud className="w-5 h-5 text-blue-600" />
            <span>Sinkronisasi Akun Cloud (Firebase)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Realtime Multi-Device Explanation Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-blue-900">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span>Sinkronisasi Real-Time Multi-Device</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Data jurnal Anda tersimpan otomatis di Firebase Firestore dan tersinkronisasi langsung antar smartphone Android, iPhone iOS, tablet, dan laptop secara instan.
          </p>
        </div>

        {/* Current Auth Status */}
        {currentUser && !currentUser.isAnonymous ? (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-[11px] text-emerald-700 font-medium">Akun Terhubung:</div>
                <div className="text-sm font-bold text-emerald-900">{currentUser.email || currentUser.displayName || 'Pengguna Terotentikasi'}</div>
              </div>
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>

            <button
              onClick={handleSignOut}
              className="w-full py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Akun Ini</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="text-xs text-slate-600">
              {isRegisterMode
                ? 'Buat akun untuk mengamankan dan menyinkronkan data jurnal antar perangkat.'
                : 'Masuk dengan akun Anda untuk memuat data jurnal yang telah tersimpan.'}
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Google Sign-in Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Lanjutkan dengan Google</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-slate-200"></div>
              <span className="shrink mx-3 text-[11px] text-slate-400 font-medium">atau dengan email</span>
              <div className="grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama.guru@sekolah.sch.id"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isRegisterMode ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{isLoading ? 'Mendaftarkan...' : 'Daftar Akun Baru'}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{isLoading ? 'Masuk...' : 'Masuk ke Akun'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-semibold"
              >
                {isRegisterMode
                  ? 'Sudah punya akun? Masuk di sini'
                  : 'Belum punya akun? Buat Akun Baru'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
