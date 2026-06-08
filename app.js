const grid = document.getElementById('soundboard-grid');
const searchBar = document.getElementById('search-bar');
const categoryFilter = document.getElementById('category-filter');

let currentAudio = null;
let favoris = JSON.parse(localStorage.getItem('mesFavoris')) || [];
let currentCategory = 'all';

// 1. EXTRACTION DES CATÉGORIES
// On regarde le nom des dossiers pour créer la liste des catégories
const categoriesUniques = [...new Set(SOUNDS_LIST.map(chemin => {
    const parts = chemin.split('/');
    return parts.length > 1 ? parts[0] : 'Divers';
}))];

// On remplit le menu déroulant avec les catégories trouvées
categoriesUniques.sort().forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = '📂 ' + cat;
    categoryFilter.appendChild(option);
});

// 2. FONCTION POUR AFFICHER LES BOUTONS
function renderButtons() {
    grid.innerHTML = '';
    
    const sonsTries = [...SOUNDS_LIST].sort((a, b) => {
        const aFav = favoris.includes(a);
        const bFav = favoris.includes(b);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        
        // Extraction du nom du fichier pour le tri alphabétique
        const nomA = a.split('/').pop();
        const nomB = b.split('/').pop();
        return nomA.localeCompare(nomB);
    });

    sonsTries.forEach(chemin => {
        const parts = chemin.split('/');
        const categorie = parts.length > 1 ? parts[0] : 'Divers';
        const nomFichier = parts[parts.length - 1];

        // Si on a sélectionné une catégorie spécifique et que ce n'est pas la bonne, on passe au son suivant
        if (currentCategory !== 'all' && currentCategory !== categorie) return;

        let nomNettoye = nomFichier.replace('.mp3', '').replace(/_/g, ' ').replace(/-/g, ' ');
        nomNettoye = nomNettoye.charAt(0).toUpperCase() + nomNettoye.slice(1);

        const card = document.createElement('div');
        card.className = 'sound-card';
        card.dataset.name = nomNettoye.toLowerCase();

        const playBtn = document.createElement('button');
        playBtn.className = 'play-btn';
        // On affiche le nom et on ajoute la catégorie en tout petit en dessous
        playBtn.innerHTML = `${nomNettoye}<br><span style="font-size: 11px; opacity: 0.7;">${categorie}</span>`;
        playBtn.addEventListener('click', () => playSound(chemin));

        const favBtn = document.createElement('button');
        favBtn.className = 'fav-btn';
        const isFav = favoris.includes(chemin);
        favBtn.textContent = isFav ? '★' : '☆';
        if (isFav) favBtn.classList.add('active');
        
        favBtn.addEventListener('click', () => toggleFavori(chemin));

        card.appendChild(playBtn);
        card.appendChild(favBtn);
        grid.appendChild(card);
    });
}

function playSound(cheminDuFichier) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    const cheminSecurise = encodeURI('Sons/' + cheminDuFichier);
    currentAudio = new Audio(cheminSecurise);
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

// 3. SYSTÈME DE RECHERCHE
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

// 4. ÉCOUTEURS D'ÉVÉNEMENTS
searchBar.addEventListener('input', filtrerRecherche);

categoryFilter.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    renderButtons();
    filtrerRecherche(); // On relance la recherche textuelle au cas où il y avait déjà du texte
});

// Démarrage
renderButtons();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log("Service Worker prêt !"))
        .catch(err => console.log("Erreur :", err));
}