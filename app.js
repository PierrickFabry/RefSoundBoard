const grid = document.getElementById('soundboard-grid');
const searchBar = document.getElementById('search-bar');
const categoryFilter = document.getElementById('category-filter');
const randomBtn = document.getElementById('random-btn');
const volumeSlider = document.getElementById('volume-slider');

let currentAudio = null;
let favoris = JSON.parse(localStorage.getItem('mesFavoris')) || [];
let currentCategory = 'all';
let currentVolume = 1.0; 

const categoryEmojis = {
    'Memes': '🤡',
    'Films': '🎬',
    'Bruitages': '💥',
    'Coupet' : '🧤​',
    'Les tipeu' : '🧸​',
    'Musique': '🎵',
    'Kaamelott': '🏰​',
    'Kronk' : '💪​',
    'René' : '⚽​',
    'Divers': '📁'
};

function getEmoji(category) {
    return categoryEmojis[category] || '📁';
}

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

        if (currentCategory === 'favorites') {
            if (!isFav) return; 
        } else if (currentCategory !== 'all' && currentCategory !== categorie) {
            return; 
        }

        let nomNettoye = nomFichier.replace('.mp3', '').replace(/_/g, ' ').replace(/-/g, ' ');
        nomNettoye = nomNettoye.charAt(0).toUpperCase() + nomNettoye.slice(1);

        const card = document.createElement('div');
        card.className = 'sound-card';
        card.dataset.name = nomNettoye.toLowerCase();

        const playBtn = document.createElement('button');
        playBtn.className = 'play-btn';
        if (isFav) playBtn.classList.add('fav-active');

        playBtn.innerHTML = `<span class="sound-title">${nomNettoye}</span><span class="sound-category">${getEmoji(categorie)} ${categorie}</span>`;
        playBtn.addEventListener('click', () => playSound(chemin));

        // -- COLONNE DES ACTIONS (Favoris + Partage) --
        const actionsCol = document.createElement('div');
        actionsCol.className = 'actions-col';

        // Bouton Favoris
        const favBtn = document.createElement('button');
        favBtn.className = 'fav-btn';
        favBtn.textContent = isFav ? '★' : '☆';
        if (isFav) favBtn.classList.add('active');
        favBtn.addEventListener('click', () => toggleFavori(chemin));

        // Nouveau Bouton Partage
        const shareBtn = document.createElement('button');
        shareBtn.className = 'share-btn';
        shareBtn.textContent = '📤';
        shareBtn.addEventListener('click', () => partagerSon(chemin, nomNettoye));

        // On assemble tout
        actionsCol.appendChild(favBtn);
        actionsCol.appendChild(shareBtn);

        card.appendChild(playBtn);
        card.appendChild(actionsCol);
        grid.appendChild(card);
    });
}

function playSound(cheminDuFichier) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    const cheminSecurise = encodeURI('sons/' + cheminDuFichier);
    currentAudio = new Audio(cheminSecurise);
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

// -- NOUVELLE FONCTION DE PARTAGE DE FICHIER AUDIO --
async function partagerSon(cheminDuFichier, nomNettoye) {
    try {
        // 1. On va chercher le fichier audio réel pour le télécharger
        const cheminSecurise = encodeURI('Sons/' + cheminDuFichier);
        const response = await fetch(cheminSecurise);
        const blob = await response.blob();
        
        // 2. On transforme les données en fichier lisible pour les autres apps
        const file = new File([blob], nomNettoye + '.mp3', { type: 'audio/mpeg' });

        // 3. On demande au téléphone d'ouvrir son menu de partage natif
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: nomNettoye,
                text: "🔊 Écoute ça : " + nomNettoye
            });
        } else {
            alert("Ton navigateur ne supporte pas l'envoi direct de fichiers. 😔");
        }
    } catch (error) {
        console.error("Erreur de partage:", error);
    }
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

searchBar.addEventListener('input', filtrerRecherche);

categoryFilter.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    renderButtons();
    filtrerRecherche();
});

volumeSlider.addEventListener('input', (e) => {
    currentVolume = e.target.value;
    if (currentAudio) {
        currentAudio.volume = currentVolume; 
    }
});

randomBtn.addEventListener('click', () => {
    if (SOUNDS_LIST.length === 0) return;
    const randomIndex = Math.floor(Math.random() * SOUNDS_LIST.length);
    const randomSound = SOUNDS_LIST[randomIndex];
    playSound(randomSound);
});

renderButtons();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log("Service Worker prêt !"))
        .catch(err => console.log("Erreur :", err));
}