// Configuración
const YOUTUBE_API_KEY = 'AIzaSyB5tQJNfhfhNboaTvupXr5i1hjjIkjJizM'; // Reemplazar con tu API key de YouTube
const MAX_RESULTS = 10;
const RAPID_API_KEY = 'f8d8c662a6msh3f2981e403a1283p157679jsn94ae201da60d'; // Tu API key de RapidAPI

// Elementos del DOM
let searchInput;
let searchButton;
let resultsContainer;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    searchInput = document.getElementById('searchInput');
    searchButton = document.getElementById('searchButton');
    resultsContainer = document.getElementById('resultsContainer');

    // Event listeners
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', handleEnterKey);
});

// Manejadores de eventos
function handleSearch() {
    const query = searchInput.value.trim();
    if (query) {
        searchVideos(query);
    }
}

function handleEnterKey(e) {
    if (e.key === 'Enter') {
        handleSearch();
    }
}

// Funciones principales
async function searchVideos(query) {
    try {
        resultsContainer.innerHTML = '<div class="loading">Buscando videos...</div>';

        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${MAX_RESULTS}&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Error en la búsqueda');
        }

        const data = await response.json();
        
        const videos = data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.medium.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString()
        }));

        displayResults(videos);
    } catch (error) {
        console.error('Error al buscar videos:', error);
        resultsContainer.innerHTML = '<p class="error-message">Error al buscar videos. Por favor, intenta de nuevo.</p>';
    }
}



async function downloadVideo(videoId) {
    const progressBar = document.getElementById(`progress-${videoId}`);
    const status = document.getElementById(`status-${videoId}`);

    try {
        status.innerText = "Iniciando descarga...";
        progressBar.style.width = "25%";

        const response = await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`, {
            method: "GET",
            headers: {
                "x-rapidapi-host": "youtube-mp36.p.rapidapi.com",
                "x-rapidapi-key": RAPID_API_KEY
            }
        });

        progressBar.style.width = "50%";

        if (!response.ok) throw new Error("Error en la conversión");

        const data = await response.json();
        progressBar.style.width = "75%";

        // Iniciar la descarga
        const a = document.createElement('a');
        a.href = data.link;
        a.download = 'audio.mp3';
        a.click();

        progressBar.style.width = "100%";
        status.innerText = "¡Descarga completada!";
    } catch (error) {
        status.innerText = "Error en la descarga";
        progressBar.style.width = "0";
        console.error(error);
    }
}

// Modificación del JavaScript para manejar el carrusel
document.addEventListener('DOMContentLoaded', () => {
    searchInput = document.getElementById('searchInput');
    searchButton = document.getElementById('searchButton');
    resultsContainer = document.getElementById('resultsContainer');

    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', handleEnterKey);
});

function displayResults(videos) {
    resultsContainer.innerHTML = '';
    
    // Agrupar videos en grupos de 3 para el carrusel
    for (let i = 0; i < videos.length; i += 3) {
        const carouselItem = document.createElement('div');
        carouselItem.className = `carousel-item ${i === 0 ? 'active' : ''}`;
        
        const row = document.createElement('div');
        row.className = 'row';
        
        // Agregar hasta 3 videos por slide
        for (let j = i; j < Math.min(i + 3, videos.length); j++) {
            const col = document.createElement('div');
            col.className = 'col-md-4';
            col.appendChild(createVideoCard(videos[j]));
            row.appendChild(col);
        }
        
        carouselItem.appendChild(row);
        resultsContainer.appendChild(carouselItem);
    }
}

function createVideoCard(video) {
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    videoCard.innerHTML = `
        <img class="video-thumbnail img-fluid" src="${video.thumbnail}" alt="${video.title}">
        <div class="video-info p-3">
            <div class="video-title text-light">${video.title}</div>
            <div class="channel-info text-gray">
                <small>
                    <i class="fas fa-user me-1"></i> ${video.channelTitle}<br>
                    <i class="fas fa-calendar me-1"></i> ${video.publishedAt}
                </small>
            </div>
            <button class="btn btn-youtube w-100 mt-3" data-video-id="${video.id}">
                <i class="fas fa-download me-1"></i> Descargar MP3
            </button>
            <div class="progress mt-2" style="display: none;">
                <div class="progress-bar bg-youtube" id="progress-${video.id}" 
                     role="progressbar" style="width: 0%"></div>
            </div>
            <div class="status text-gray mt-2" id="status-${video.id}"></div>
        </div>
    `;

    const downloadBtn = videoCard.querySelector('.btn-youtube');
    downloadBtn.addEventListener('click', () => downloadVideo(video.id));

    return videoCard;
}

// Contador de visitas
document.addEventListener('DOMContentLoaded', function() {
    updateVisitorCount();
});

function updateVisitorCount() {
    // Obtener el contador actual
    let count = localStorage.getItem('visitorCount');
    
    // Si es la primera visita, inicializar el contador
    if (!count) {
        count = 0;
    }
    
    // Incrementar el contador
    count = parseInt(count) + 1;
    
    // Guardar el nuevo valor
    localStorage.getItem('visitorCount', count);
    
    // Actualizar el display con animación
    const countDisplay = document.getElementById('visitorCount');
    if (countDisplay) {
        animateValue(countDisplay, 0, count, 1000);
    }
}

// Función para animar el contador
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        obj.innerHTML = current.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Función para formatear números grandes
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}   