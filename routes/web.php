<?php

use App\Http\Controllers\SpatialController;
use Illuminate\Support\Facades\Route;

// Halaman utama (tampilan peta)
Route::get('/', function () {
    return view('index'); // nanti kita buat file resources/views/index.blade.php
});

// Group rute API dengan prefix /api
Route::prefix('api')->group(function () {
    // Ambil semua data vektor
    Route::get('/spatials', [SpatialController::class, 'index']);

    // Simpan vektor baru
    Route::post('/spatials', [SpatialController::class, 'store']);

    // Hapus vektor berdasarkan ID
    Route::delete('/spatials/{id}', [SpatialController::class, 'destroy']);
});
