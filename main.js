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

function displayResults(videos) {
    resultsContainer.innerHTML = '';
    
    videos.forEach(video => {
        const videoCard = createVideoCard(video);
        resultsContainer.appendChild(videoCard);
    });
}

function createVideoCard(video) {
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    videoCard.innerHTML = `
        <img class="video-thumbnail" src="${video.thumbnail}" alt="${video.title}">
        <div class="video-info">
            <div class="video-title">${video.title}</div>
            <div class="channel-info">
                <small>
                    <i class="fas fa-user"></i> ${video.channelTitle}<br>
                    <i class="fas fa-calendar"></i> ${video.publishedAt}
                </small>
            </div>
            <button class="download-btn" data-video-id="${video.id}">
                <i class="fas fa-download"></i> Descargar MP3
            </button>
            <div class="progress-container">
                <div class="progress-bar" id="progress-${video.id}"></div>
            </div>
            <div class="status" id="status-${video.id}"></div>
        </div>
    `;

    const downloadBtn = videoCard.querySelector('.download-btn');
    downloadBtn.addEventListener('click', () => downloadVideo(video.id));

    return videoCard;
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