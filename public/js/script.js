var layerVisibility = {};
var layerStore = {};

// Inisialisasi peta
var map = L.map("map").setView([-6.2088, 106.8456], 10); // Jakarta

// Tile layer (gunakan provider yang sesuai)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Variabel untuk menyimpan layer yang digambar
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Inisialisasi Leaflet.draw control
var drawControl = new L.Control.Draw({
    edit: false,
    draw: {
        polygon: {
            shapeOptions: {
                color: "#3498db",
                weight: 3,
            },
        },
        polyline: {
            shapeOptions: {
                color: "#3498db",
                weight: 3,
            },
        },
        marker: {
            shapeOptions: {
                color: "#3498db",
            },
        },
        rectangle: false,
        circle: false,
        circlemarker: false,
    },
});
map.addControl(drawControl);

// Fungsi untuk memicu drawing mode tertentu
function enableDrawingMode(type) {
    var drawControl = null;
    // Cari control Draw yang sudah ada
    map.eachLayer(function (layer) {
        if (layer instanceof L.Control.Draw) {
            drawControl = layer;
        }
    });
    if (drawControl) {
        // Nonaktifkan edit mode jika aktif
        if (drawControl._toolbars && drawControl._toolbars.edit) {
            drawControl._toolbars.edit.disable();
        }
        // Aktifkan drawing sesuai tipe
        switch (type) {
            case "point":
                drawControl._toolbars.draw._modes.marker.handler.enable();
                break;
            case "line":
                drawControl._toolbars.draw._modes.polyline.handler.enable();
                break;
            case "polygon":
                drawControl._toolbars.draw._modes.polygon.handler.enable();
                break;
        }
    }
}

// Tangani event saat selesai menggambar (draw:created)
map.on("draw:created", function (e) {
    var layer = e.layer;
    var type = e.layerType; // 'marker', 'polyline', 'polygon'
    var geometry = layer.toGeoJSON().geometry;

    // Tentukan tipe untuk disimpan
    var geomType = "";
    if (type === "marker") geomType = "point";
    else if (type === "polyline") geomType = "line";
    else if (type === "polygon") geomType = "polygon";

    // Minta nama vektor (gunakan prompt sederhana)
    var name = prompt(
        "Masukkan nama vektor:",
        "Vektor " + new Date().toLocaleTimeString(),
    );
    if (!name) {
        // Jika user batal, hapus layer yang baru digambar
        drawnItems.removeLayer(layer);
        return;
    }

    // Siapkan data untuk dikirim ke backend
    var data = {
        name: name,
        type: geomType,
        geometry: geometry,
    };

    // Kirim ke server
    fetch("/api/spatials", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document
                .querySelector('meta[name="csrf-token"]')
                .getAttribute("content"),
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((result) => {
            if (result.data && result.data.id) {
                // Tambahkan layer ke drawnItems (sudah ditambahkan otomatis oleh Leaflet.draw)
                // Tapi kita perlu menyimpan id dari server untuk referensi
                layer._id = result.data.id;
                layer._name = result.data.name;
                layer._type = result.data.type;

                layerStore[result.data.id] = layer;

                // ❌ jangan langsung tampil
                drawnItems.removeLayer(layer);

                // default hidden
                layerVisibility[result.data.id] = false;

                // Tambahkan ke sidebar
                addToSidebar(
                    result.data.id,
                    result.data.name,
                    result.data.type,
                );
            } else {
                alert(
                    "Gagal menyimpan: " + (result.message || "Unknown error"),
                );
                drawnItems.removeLayer(layer);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("Terjadi kesalahan saat menyimpan");
            drawnItems.removeLayer(layer);
        });
});

// Fungsi menambahkan item ke sidebar
function addToSidebar(id, name, type) {
    var list = document.getElementById("vector-list");
    // Hapus pesan "Belum ada data" jika ada
    if (
        list.children.length === 1 &&
        list.children[0].innerText === "Belum ada data"
    ) {
        list.innerHTML = "";
    }
    var li = document.createElement("li");
    li.className = "vector-item";
    li.setAttribute("data-id", id);
    li.innerHTML = `
                <div class="vector-info">
                    <div class="vector-name">${escapeHtml(name)}</div>
                    <div class="vector-type">Tipe Vektor : ${type}</div>
                </div>
                <div style="display:flex; gap:5px;">
                    <button class="toggle-btn" data-id="${id}">
                        <i class="fas fa-eye-slash"></i>
                    </button>
                    <button class="delete-btn" data-id="${id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
    list.appendChild(li);

    // Event hapus dari sidebar
    li.querySelector(".delete-btn").addEventListener("click", function (e) {
        e.stopPropagation();
        var vectorId = this.getAttribute("data-id");
        deleteSpatial(vectorId);
    });

    li.querySelector(".toggle-btn").addEventListener("click", function (e) {
        e.stopPropagation();
        var id = this.getAttribute("data-id");
        toggleLayer(id, this);
    });
}

// Fungsi menghapus vektor
function deleteSpatial(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus vektor ini?")) return;

    fetch(`/api/spatials/${id}`, {
        method: "DELETE",
        headers: {
            "X-CSRF-TOKEN": document
                .querySelector('meta[name="csrf-token"]')
                .getAttribute("content"),
        },
    })
        .then((response) => response.json())
        .then((result) => {
            if (result.message) {
                // Hapus dari peta (cari layer dengan _id sama)
                drawnItems.eachLayer(function (layer) {
                    if (layer._id == id) {
                        drawnItems.removeLayer(layer);
                    }
                });
                // Hapus dari sidebar
                var item = document.querySelector(
                    `.vector-item[data-id="${id}"]`,
                );
                if (item) item.remove();
                // Jika sidebar kosong, tampilkan pesan
                var list = document.getElementById("vector-list");
                if (list.children.length === 0) {
                    list.innerHTML =
                        '<li style="text-align:center; color:#7f8c8d;">Belum ada data</li>';
                }
            } else {
                alert(
                    "Gagal menghapus: " + (result.message || "Unknown error"),
                );
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("Terjadi kesalahan saat menghapus");
        });
}

// Fungsi untuk memuat semua vektor dari database
function loadSpatials() {
    fetch("/api/spatials")
        .then((response) => response.json())
        .then((data) => {
            // data adalah FeatureCollection
            if (data.features && data.features.length > 0) {
                data.features.forEach((feature) => {
                    var geom = feature.geometry;
                    var props = feature.properties;
                    var layer = null;

                    // Buat layer Leaflet berdasarkan tipe geometri
                    if (geom.type === "Point") {
                        var coords = [geom.coordinates[1], geom.coordinates[0]];
                        layer = L.marker(coords);
                    } else if (geom.type === "LineString") {
                        var latlngs = geom.coordinates.map((coord) => [
                            coord[1],
                            coord[0],
                        ]);
                        layer = L.polyline(latlngs, {
                            color: "#3498db",
                            weight: 3,
                        });
                    } else if (geom.type === "Polygon") {
                        var latlngs = geom.coordinates[0].map((coord) => [
                            coord[1],
                            coord[0],
                        ]);
                        layer = L.polygon(latlngs, {
                            color: "#3498db",
                            weight: 3,
                        });
                    }

                    if (layer) {
                        layer._id = props.id;
                        layer._name = props.name;
                        layer._type = props.type;

                        layerStore[props.id] = layer;
                        layerVisibility[props.id] = false;

                        addToSidebar(props.id, props.name, props.type);
                    }
                });
            } else {
                // Tidak ada data, tampilkan pesan di sidebar (sudah default)
                var list = document.getElementById("vector-list");
                if (list.children.length === 0) {
                    list.innerHTML =
                        '<li style="text-align:center; color:#7f8c8d;">Belum ada data</li>';
                }
            }
        })
        .catch((error) => {
            console.error("Gagal memuat data:", error);
        });
}

// Fungsi helper untuk menghindari XSS
function escapeHtml(text) {
    var map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, function (m) {
        return map[m];
    });
}

function toggleLayer(id, button) {
    var layer = layerStore[id];

    if (!layer) return;

    if (layerVisibility[id]) {
        // sembunyikan
        drawnItems.removeLayer(layer);
        layerVisibility[id] = false;
        button.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        // tampilkan
        drawnItems.addLayer(layer);
        layerVisibility[id] = true;
        button.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

// Muat data saat halaman siap
loadSpatials();
