const grid = document.getElementById('soundboard-grid');
const searchBar = document.getElementById('search-bar');
const categoryFilter = document.getElementById('category-filter');
const randomBtn = document.getElementById('random-btn');
const volumeSlider = document.getElementById('volume-slider');

let currentAudio = null;
let favoris = JSON.parse(localStorage.getItem('mesFavoris')) || [];
let currentCategory = 'all';
let currentVolume = 1.0; // Le volume par défaut (à 100%)

// 1. DICTIONNAIRE D'EMOJIS PAR DOSSIER
// N'hésite pas à modifier ces noms pour qu'ils correspondent exactement aux dossiers de ton GitHub
const categoryEmojis = {
    'Memes': '🤡',
    'Films': '🎬',
    'Bruitages': '💥',
    'Musique': '🎵',
    'Kaamelott': '🏰​',
    'Divers': '📁'
};

// Fonction pour récupérer l'emoji (met '📁' par défaut si le dossier n'est pas dans le dictionnaire)
function getEmoji(category) {
    return categoryEmojis[category] || '📁';
}

// 2. EXTRACTION DES CATÉGORIES
const categoriesUniques = [...new Set(SOUNDS_LIST.map(chemin => {
    const parts = chemin.split('/');
    return parts.length > 1 ? parts[0] : 'Divers';
}))];

categoriesUniques.sort().forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = getEmoji(cat) + ' ' + cat;
    categoryFilter.appendChild(option);
});

// 3. FONCTION POUR AFFICHER LES BOUTONS
function renderButtons() {
    grid.innerHTML = '';
    
    const sonsTries = [...SOUNDS_LIST].sort((a, b) => {
        const aFav = favoris.includes(a);
        const bFav = favoris.includes(b);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        
        const nomA = a.split('/').pop();
        const nomB = b.split('/').pop();
        return nomA.localeCompare(nomB);
    });

    sonsTries.forEach(chemin => {
        const parts = chemin.split('/');
        const categorie = parts.length > 1 ? parts[0] : 'Divers';
        const nomFichier = parts[parts.length - 1];
        const isFav = favoris.includes(chemin);

        // --- LA MAGIE DU FILTRE FAVORIS ---
        if (currentCategory === 'favorites') {
            // Si on a choisi le filtre "Favoris", on ignore les sons sans étoile
            if (!isFav) return; 
        } else if (currentCategory !== 'all' && currentCategory !== categorie) {
            // Sinon, c'est un filtre de catégorie classique
            return; 
        }

        let nomNettoye = nomFichier.replace('.mp3', '').replace(/_/g, ' ').replace(/-/g, ' ');
        nomNettoye = nomNettoye.charAt(0).toUpperCase() + nomNettoye.slice(1);

        const card = document.createElement('div');
        card.className = 'sound-card';
        card.dataset.name = nomNettoye.toLowerCase();

        const playBtn = document.createElement('button');
        playBtn.className = 'play-btn';
        playBtn.innerHTML = `${nomNettoye}<br><span style="font-size: 11px; opacity: 0.7;">${getEmoji(categorie)} ${categorie}</span>`;
        playBtn.addEventListener('click', () => playSound(chemin));

        const favBtn = document.createElement('button');
        favBtn.className = 'fav-btn';
        favBtn.textContent = isFav ? '★' : '☆';
        if (isFav) favBtn.classList.add('active');
        
        favBtn.addEventListener('click', () => toggleFavori(chemin));

        card.appendChild(playBtn);
        card.appendChild(favBtn);
        grid.appendChild(card);
    });
}

// 4. JOUER LE SON (AVEC LE VOLUME)
function playSound(cheminDuFichier) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    const cheminSecurise = encodeURI('Sons/' + cheminDuFichier);
    currentAudio = new Audio(cheminSecurise);
    
    // On applique le volume choisi par la jauge
    currentAudio.volume = currentVolume; 
    
    currentAudio.play();
}

function toggleFavori(cheminDuFichier) {
    if (favoris.includes(cheminDuFichier)) {
        favoris = favoris.filter(f => f !== cheminDuFichier);
    } else {
        favoris.push(cheminDuFichier);
    }
    localStorage.setItem('mesFavoris', JSON.stringify(favoris));
    renderButtons();
    filtrerRecherche();
}

function filtrerRecherche() {
    const searchTerm = searchBar.value.toLowerCase();
    const cards = document.querySelectorAll('.sound-card');
    
    cards.forEach(card => {
        if (card.dataset.name.includes(searchTerm)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// 5. NOUVEAUX ÉCOUTEURS D'ÉVÉNEMENTS
searchBar.addEventListener('input', filtrerRecherche);

categoryFilter.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    renderButtons();
    filtrerRecherche();
});

// Écouteur pour la jauge de volume
volumeSlider.addEventListener('input', (e) => {
    currentVolume = e.target.value;
    // Si un son est déjà en train de jouer, on modifie son volume en direct
    if (currentAudio) {
        currentAudio.volume = currentVolume; 
    }
});

// Écouteur pour le bouton Roulette Russe
randomBtn.addEventListener('click', () => {
    if (SOUNDS_LIST.length === 0) return;
    // On tire un nombre au hasard entre 0 et la taille de la liste
    const randomIndex = Math.floor(Math.random() * SOUNDS_LIST.length);
    const randomSound = SOUNDS_LIST[randomIndex];
    playSound(randomSound);
});

// Démarrage
renderButtons();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log("Service Worker prêt !"))
        .catch(err => console.log("Erreur :", err));
}