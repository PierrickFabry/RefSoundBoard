const grid = document.getElementById('soundboard-grid');
const searchBar = document.getElementById('search-bar');

// 1. VARIABLE POUR STOPPER LE SON
let currentAudio = null;

// 2. SYSTÈME DE FAVORIS (Lecture de la mémoire du téléphone)
let favoris = JSON.parse(localStorage.getItem('mesFavoris')) || [];

// Fonction principale pour afficher les boutons
function renderButtons() {
    grid.innerHTML = ''; // On vide la grille avant de la remplir
    
    // On trie la liste : Les favoris en premier, puis par ordre alphabétique
    const sonsTries = [...SOUNDS_LIST].sort((a, b) => {
        const aFav = favoris.includes(a);
        const bFav = favoris.includes(b);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return a.localeCompare(b);
    });

    sonsTries.forEach(fichier => {
        // Nettoyage du nom pour l'affichage
        let nomNettoye = fichier.replace('.mp3', '').replace(/_/g, ' ').replace(/-/g, ' ');
        nomNettoye = nomNettoye.charAt(0).toUpperCase() + nomNettoye.slice(1);

        // Création de la "carte" qui contient le son et l'étoile
        const card = document.createElement('div');
        card.className = 'sound-card';
        card.dataset.name = nomNettoye.toLowerCase(); // Utilisé pour la recherche secrète

        // Création du bouton Play
        const playBtn = document.createElement('button');
        playBtn.className = 'play-btn';
        playBtn.textContent = nomNettoye;
        playBtn.addEventListener('click', () => playSound(fichier));

        // Création du bouton Favori
        const favBtn = document.createElement('button');
        favBtn.className = 'fav-btn';
        const isFav = favoris.includes(fichier);
        favBtn.textContent = isFav ? '★' : '☆';
        if (isFav) favBtn.classList.add('active');
        
        favBtn.addEventListener('click', () => toggleFavori(fichier));

        // On assemble le tout
        card.appendChild(playBtn);
        card.appendChild(favBtn);
        grid.appendChild(card);
    });
}

// Fonction pour JOUER et STOPPER les sons
function playSound(nomDuFichier) {
    // Si un son est déjà en train d'être joué, on le coupe
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    
    // On lance le nouveau son
    currentAudio = new Audio('Sons/' + nomDuFichier);
    currentAudio.play();
}

// Fonction pour AJOUTER/RETIRER un favori
function toggleFavori(nomDuFichier) {
    if (favoris.includes(nomDuFichier)) {
        // S'il y est déjà, on l'enlève
        favoris = favoris.filter(f => f !== nomDuFichier);
    } else {
        // Sinon, on l'ajoute
        favoris.push(nomDuFichier);
    }
    
    // On sauvegarde dans la mémoire du téléphone
    localStorage.setItem('mesFavoris', JSON.stringify(favoris));
    
    // On rafraîchit l'interface pour remettre les favoris en haut
    renderButtons();
    filtrerSons(); // On garde la recherche active si on était en train de chercher
}

// 3. FONCTION DE RECHERCHE
function filtrerSons() {
    const searchTerm = searchBar.value.toLowerCase();
    const cards = document.querySelectorAll('.sound-card');
    
    cards.forEach(card => {
        // On vérifie si le nom du son contient ce qui est tapé dans la barre
        if (card.dataset.name.includes(searchTerm)) {
            card.style.display = 'flex'; // On l'affiche
        } else {
            card.style.display = 'none'; // On le cache
        }
    });
}

// On écoute ce qui est tapé dans la barre de recherche
searchBar.addEventListener('input', filtrerSons);

// Démarrage de l'application
renderButtons();

// Service Worker pour le hors-ligne
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log("Service Worker prêt !"))
        .catch(err => console.log("Erreur :", err));
}