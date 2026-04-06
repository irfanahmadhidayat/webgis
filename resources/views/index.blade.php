<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>WebGIS</title>

    <!-- Leaflet CSS & JS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

    <!-- Leaflet.draw CSS & JS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js"></script>

    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>

<body>

    <!-- TOPBAR -->
    <div class="topbar">
        <h1><i class="fas fa-map-marked-alt"></i> WebGIS</h1>
        <div class="toolbar">
        </div>
    </div>

    <!-- SIDEBAR -->
    <div class="sidebar">
        <h3><i class="fas fa-list"></i> Daftar Vektor</h3>
        <ul id="vector-list" class="vector-list">
            <li style="text-align:center; color:#7f8c8d;">Belum ada data</li>
        </ul>
    </div>

    <!-- MAP -->
    <div id="map"></div>

    <script src="{{ asset('js/script.js') }}"></script>
</body>

</html>
