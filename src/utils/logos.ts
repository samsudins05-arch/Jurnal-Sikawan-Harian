/**
 * Official vector SVG assets for Indonesian Government (Kabupaten Bekasi & Dinas Pendidikan)
 * and the SIJUNAWAN application logo.
 */

// SIJUNAWAN App Logo SVG
export const SIJUNAWAN_LOGO_SVG = `
<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
  <defs>
    <linearGradient id="sijunawan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
    <linearGradient id="leaf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
  </defs>
  <!-- Base Shield Badge -->
  <rect x="6" y="6" width="88" height="88" rx="20" fill="white" stroke="#e2e8f0" stroke-width="3" />
  <!-- Inner circular ring -->
  <circle cx="50" cy="46" r="30" fill="#f0fdf4" stroke="#86efac" stroke-width="2" />
  <!-- Pen & Book / Education Symbol -->
  <path d="M35 55C35 48 45 42 50 40C55 42 65 48 65 55V57C65 57 55 52 50 52C45 52 35 57 35 57V55Z" fill="#1e40af" />
  <path d="M50 25L53 38L50 42L47 38L50 25Z" fill="#2563eb" />
  <circle cx="50" cy="24" r="3.5" fill="#f59e0b" />
  <!-- Green Growth Leaf Motif -->
  <path d="M36 44C32 36 38 28 46 30C46 38 38 43 36 44Z" fill="url(#leaf-grad)" opacity="0.9" />
  <!-- Text Label -->
  <rect x="14" y="72" width="72" height="16" rx="4" fill="#1e40af" />
  <text x="50" y="83" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="900" fill="white" text-anchor="middle" letter-spacing="1">SIJUNAWAN</text>
</svg>
`;

// Lambang Kabupaten Bekasi SVG
export const LOGO_KAB_BEKASI_SVG = `
<svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
  <!-- Perisai dasar -->
  <path d="M10 15C10 15 50 8 50 8C50 8 90 15 90 15V65C90 92 50 112 50 112C50 112 10 92 10 65V15Z" fill="#16a34a" stroke="#0f172a" stroke-width="2.5" />
  
  <!-- Border dalam kuning keemasan -->
  <path d="M14 18C14 18 50 12 50 12C50 12 86 18 86 18V63C86 87 50 107 50 107C50 107 14 87 14 63V18Z" fill="#22c55e" stroke="#eab308" stroke-width="3" />
  
  <!-- Langit biru di dalam -->
  <path d="M18 22C18 22 50 16 50 16C50 16 82 22 82 22V60C82 82 50 102 50 102C50 102 18 82 18 60V22Z" fill="#0284c7" />

  <!-- Golok Candung / Lambang Perjuangan Bekasi -->
  <path d="M48 24C48 24 53 24 53 28L52 65C52 68 47 68 47 65L48 24Z" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.2" />
  <circle cx="50" cy="70" r="3.5" fill="#f59e0b" stroke="#0f172a" stroke-width="1" />
  <rect x="47" y="73" width="6" height="12" rx="1.5" fill="#78350f" stroke="#0f172a" stroke-width="1" />

  <!-- Padi dan Kapas -->
  <!-- Padi Kiri (Kuning Emas) -->
  <path d="M22 68C22 45 32 32 44 28C38 38 34 52 38 72" stroke="#eab308" stroke-width="3" stroke-linecap="round" fill="none" />
  <!-- Kapas Kanan (Putih & Hijau) -->
  <path d="M78 68C78 45 68 32 56 28C62 38 66 52 62 72" stroke="#f8fafc" stroke-width="3" stroke-linecap="round" fill="none" />

  <!-- Pita Putih SWATANTRA WIBAWA MUKTI -->
  <path d="M12 90C30 84 70 84 88 90L84 100C68 95 32 95 16 100L12 90Z" fill="#f8fafc" stroke="#0f172a" stroke-width="1.5" />
  <!-- Garis air sungai Citarum / Gelombang biru -->
  <path d="M20 74C30 71 40 76 50 74C60 72 70 76 80 74" stroke="#ffffff" stroke-width="2" fill="none" />
  <path d="M20 78C30 75 40 80 50 78C60 76 70 80 80 78" stroke="#38bdf8" stroke-width="1.5" fill="none" />
  
  <text x="50" y="96" font-family="'Times New Roman', serif" font-size="4.2" font-weight="bold" fill="#0f172a" text-anchor="middle" letter-spacing="0.3">KABUPATEN BEKASI</text>
</svg>
`;

// Logo Dinas Pendidikan / Tut Wuri Handayani SVG
export const LOGO_DISDIK_SVG = `
<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
  <!-- Bentuk Belimbing Segi Lima (Pancasila) -->
  <polygon points="50,6 92,36 76,88 24,88 8,36" fill="#0284c7" stroke="#eab308" stroke-width="3" />
  <polygon points="50,11 87,38 73,84 27,84 13,38" fill="#0369a1" />

  <!-- Sayap Kembar Tut Wuri Handayani (Kuning Emas) -->
  <!-- Sayap Kiri -->
  <path d="M50 48C38 44 26 50 20 62C28 64 36 60 48 56Z" fill="#facc15" stroke="#ca8a04" stroke-width="1" />
  <path d="M50 56C40 54 30 58 24 70C32 70 40 66 48 62Z" fill="#facc15" stroke="#ca8a04" stroke-width="1" />
  <!-- Sayap Kanan -->
  <path d="M50 48C62 44 74 50 80 62C72 64 64 60 52 56Z" fill="#facc15" stroke="#ca8a04" stroke-width="1" />
  <path d="M50 56C60 54 70 58 76 70C68 70 60 66 52 62Z" fill="#facc15" stroke="#ca8a04" stroke-width="1" />

  <!-- Nyala Api Keilmuan di Tengah -->
  <path d="M50 24C46 32 44 38 46 46C48 44 50 42 50 42C50 42 52 44 54 46C56 38 54 32 50 24Z" fill="#ef4444" stroke="#b91c1c" stroke-width="1" />
  <circle cx="50" cy="38" r="3" fill="#f59e0b" />

  <!-- Dasar Buku Terbuka -->
  <path d="M30 76C42 72 48 76 50 78C52 76 58 72 70 76V82C58 78 52 82 50 82C48 82 42 78 30 82V76Z" fill="#ffffff" stroke="#0f172a" stroke-width="1" />
  
  <text x="50" y="96" font-family="'Plus Jakarta Sans', sans-serif" font-size="7" font-weight="bold" fill="#0369a1" text-anchor="middle">DINAS PENDIDIKAN</text>
</svg>
`;
