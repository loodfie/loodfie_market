<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website Pertamaku</title>
    <style>
        /* CSS Sederhana agar tampilannya rapi */
        body { font-family: sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
        
        /* Gaya Menu Navigasi */
        nav { background: #FF2D20; padding: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        nav a { color: white; text-decoration: none; margin-right: 20px; font-weight: bold; font-size: 18px; }
        nav a:hover { text-decoration: underline; }

        /* Gaya Konten Utama */
        .container { padding: 40px; max-width: 800px; margin: 0 auto; min-height: 400px; }

        /* Gaya Footer */
        footer { background: #333; color: white; text-align: center; padding: 20px; margin-top: 50px; }
    </style>
</head>
<body>

    <nav>
        <a href="/">Beranda</a>
        <a href="/galeri">Galeri</a>
        <a href="/sapa/Pengunjung">Profil Saya</a>
    </nav>

    <div class="container">
        @yield('konten')
    </div>

    <footer>
        &copy; 2026 Belajar Laravel - Dibuat dengan ❤️
    </footer>

</body>
</html>