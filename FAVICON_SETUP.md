# Theme-Aware Favicon Setup

ShortLink menggunakan favicon yang responsif terhadap tema (light/dark mode) sistem pengguna. Dokumentasi ini menjelaskan bagaimana konfigurasi ini bekerja.

## Cara Kerja

### 1. SVG Favicon dengan Embedded CSS

File `public/favicon.svg` mengandung CSS media query yang secara otomatis mengganti icon berdasarkan preferensi tema sistem:

```svg
<style>
  #light-icon {
    display: inline;
  }
  #dark-icon {
    display: none;
  }

  @media (prefers-color-scheme: dark) {
    #light-icon {
      display: none;
    }
    #dark-icon {
      display: inline;
    }
  }
</style>
```

**Light Mode**: Menampilkan logo biru (#4169E1)
**Dark Mode**: Menampilkan logo putih (white)

### 2. Urutan Prioritas Favicon di HTML

Di `index.html`, favicon diatur dengan urutan prioritas berikut:

```html
<!-- SVG first untuk theme-aware support -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

**Urutan penting:**
1. **SVG favicon** ditempatkan pertama - browser modern yang mendukung SVG akan menggunakannya
2. **PNG favicon** sebagai fallback untuk browser yang tidak mendukung SVG
3. **ICO favicon** untuk kompatibilitas browser lama
4. **Apple touch icon** untuk perangkat iOS

### 3. Theme Color yang Adaptif

Meta tag `theme-color` juga disesuaikan dengan tema:

```html
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
```

Ini mengubah warna browser toolbar/address bar sesuai tema sistem.

## Dukungan Browser

| Browser | SVG Favicon | Theme Detection | Status |
|---------|-------------|-----------------|--------|
| Chrome 80+ | ✅ | ✅ | Fully Supported |
| Firefox 85+ | ✅ | ✅ | Fully Supported |
| Safari 15+ | ✅ | ✅ | Fully Supported |
| Edge 80+ | ✅ | ✅ | Fully Supported |
| Older Browsers | ❌ | ❌ | Falls back to PNG/ICO |

Browser yang tidak mendukung SVG favicon akan secara otomatis menggunakan `favicon-96x96.png` atau `favicon.ico`.

## File Favicon yang Tersedia

```
public/
├── favicon.svg              # Theme-aware SVG (prioritas utama)
├── favicon.ico              # ICO untuk browser lama
├── favicon-96x96.png        # PNG fallback
├── apple-touch-icon.png     # iOS home screen icon
├── web-app-manifest-192x192.png  # PWA icon
└── web-app-manifest-512x512.png  # PWA icon
```

## Testing Theme-Aware Favicon

### Di Browser Desktop

1. **Chrome/Edge:**
   - Buka DevTools (F12)
   - Tekan Ctrl+Shift+P (Windows) atau Cmd+Shift+P (Mac)
   - Ketik "Rendering"
   - Scroll ke bawah ke "Emulate CSS media feature prefers-color-scheme"
   - Pilih "light" atau "dark"
   - Perhatikan favicon di tab berubah

2. **Firefox:**
   - Buka `about:config`
   - Cari `ui.systemUsesDarkTheme`
   - Set ke `0` (light) atau `1` (dark)
   - Refresh halaman

3. **Safari:**
   - Buka Safari Preferences → Advanced → Show Develop menu
   - Develop → Experimental Features → Dark Mode CSS Support
   - Ubah sistem appearance (System Preferences → General → Appearance)

### Di Browser Mobile

1. **Android:**
   - Settings → Display → Dark theme (toggle on/off)
   - Buka website di browser
   - Favicon akan berubah otomatis

2. **iOS:**
   - Settings → Display & Brightness → Light/Dark
   - Buka website di Safari
   - Favicon akan berubah otomatis

## Regenerate Favicon dengan realfavicongenerator.net

Jika Anda ingin membuat ulang favicon:

1. **Persiapkan 2 versi logo:**
   - Logo dengan warna untuk light mode (misalnya: biru)
   - Logo dengan warna untuk dark mode (misalnya: putih/terang)

2. **Buat SVG dengan embedded CSS:**
   ```svg
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
     <style>
       #light-icon { display: inline; }
       #dark-icon { display: none; }

       @media (prefers-color-scheme: dark) {
         #light-icon { display: none; }
         #dark-icon { display: inline; }
       }
     </style>

     <g id="light-icon">
       <!-- Konten logo untuk light mode -->
     </g>

     <g id="dark-icon">
       <!-- Konten logo untuk dark mode -->
     </g>
   </svg>
   ```

3. **Upload ke realfavicongenerator.net:**
   - Upload SVG file
   - Generate semua format favicon
   - Download package

4. **Update file di project:**
   - Copy semua file ke folder `public/`
   - Pastikan SVG favicon tetap memiliki embedded CSS
   - Update `index.html` jika ada perubahan pada HTML yang disarankan

## Troubleshooting

### Favicon tidak berubah saat mengganti tema

**Penyebab:**
- Browser cache menyimpan favicon lama
- Browser tidak mendukung SVG favicon
- CSS di SVG tidak valid

**Solusi:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5 atau Cmd+Shift+R)
3. Test di Incognito/Private mode
4. Validasi SVG di https://validator.w3.org/

### Favicon menampilkan warna yang salah

**Penyebab:**
- `prefers-color-scheme` media query tidak berfungsi
- ID element di SVG tidak match dengan CSS selector

**Solusi:**
1. Periksa CSS di dalam `favicon.svg`
2. Pastikan ID `#light-icon` dan `#dark-icon` sesuai
3. Test media query di DevTools

### Browser menggunakan PNG/ICO daripada SVG

**Penyebab:**
- Browser tidak mendukung SVG favicon
- MIME type tidak dikonfigurasi dengan benar di server

**Solusi:**
1. Update browser ke versi terbaru
2. Pastikan server mengirim `Content-Type: image/svg+xml` untuk file SVG
3. Verifikasi di Network tab DevTools

### iOS tidak menampilkan favicon yang benar

**Catatan:**
- iOS Safari tidak mendukung regular favicon untuk home screen
- Gunakan `apple-touch-icon.png` (180x180px) untuk iOS home screen icon
- Favicon di Safari tab browser akan mengikuti theme-aware SVG di iOS 15+

## Referensi

- [SVG Favicons Documentation](https://css-tricks.com/svg-favicons-and-all-the-fun-things-we-can-do-with-them/)
- [prefers-color-scheme MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [Real Favicon Generator](https://realfavicongenerator.net/)
- [Can I Use: SVG Favicons](https://caniuse.com/link-icon-svg)
