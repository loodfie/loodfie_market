<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SapaController extends Controller
{
    // Halaman Depan
    public function beranda()
    {
        return view('beranda');
    }

    // Halaman Galeri
    public function galeri()
    {
        return view('galeri');
    }

    // Halaman Profil (Dinamis)
    public function sapaOrang($nama)
    {
        return view('profil', ['nama_user' => $nama]);
    }
}