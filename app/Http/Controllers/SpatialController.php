<?php

namespace App\Http\Controllers;

use App\Models\Spatial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SpatialController extends Controller
{
    /**
     * Ambil semua data vektor dalam format GeoJSON untuk ditampilkan di peta.
     */
    public function index()
    {
        // Ambil semua data, konversi geom ke GeoJSON menggunakan ST_AsGeoJSON
        $spatials = Spatial::select(
            'id',
            'name',
            'type',
            DB::raw('ST_AsGeoJSON(geom) as geom')
        )->get();

        // Ubah hasil query menjadi array yang siap di-encode sebagai JSON
        $features = $spatials->map(function ($spatial) {
            return [
                'type' => 'Feature',
                'geometry' => json_decode($spatial->geom), // ST_AsGeoJSON mengembalikan string JSON
                'properties' => [
                    'id' => $spatial->id,
                    'name' => $spatial->name,
                    'type' => $spatial->type,
                ],
            ];
        });

        // Kembalikan dalam format GeoJSON FeatureCollection
        return response()->json([
            'type' => 'FeatureCollection',
            'features' => $features,
        ]);
    }

    /**
     * Simpan vektor baru dari data GeoJSON yang dikirim frontend.
     */
    public function store(Request $request)
    {
        // Validasi input
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:point,line,polygon',
            'geometry' => 'required|array', // GeoJSON geometry object
        ]);

        // Ambil geometry dari request (dalam bentuk array)
        $geometry = $request->geometry;

        // Konversi array GeoJSON menjadi JSON string untuk fungsi ST_GeomFromGeoJSON
        $geojson = json_encode($geometry);

        // Simpan ke database menggunakan raw query (agar bisa memanggil fungsi PostGIS)
        $id = DB::table('spatials')->insertGetId([
            'name' => $request->name,
            'type' => $request->type,
            'geom' => DB::raw("ST_GeomFromGeoJSON('{$geojson}')"),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Ambil data yang baru disimpan untuk dikembalikan (dengan geom sebagai GeoJSON)
        $saved = Spatial::select(
            'id',
            'name',
            'type',
            DB::raw('ST_AsGeoJSON(geom) as geom')
        )->where('id', $id)->first();

        return response()->json([
            'message' => 'Vektor berhasil disimpan',
            'data' => [
                'id' => $saved->id,
                'name' => $saved->name,
                'type' => $saved->type,
                'geometry' => json_decode($saved->geom),
            ],
        ], 201);
    }

    /**
     * Hapus vektor berdasarkan ID.
     */
    public function destroy($id)
    {
        $spatial = Spatial::findOrFail($id);
        $spatial->delete();

        return response()->json(['message' => 'Vektor berhasil dihapus']);
    }
}
