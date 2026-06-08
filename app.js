const grid = document.getElementById('soundboard-grid');

// SOUNDS_LIST est alimenté automatiquement par sounds-config.js
SOUNDS_LIST.forEach(fichier => {
    const bouton = document.createElement('button');
    let nomNettoye = fichier.replace('.mp3', '').replace(/_/g, ' ').replace(/-/g, ' ');
    nomNettoye = nomNettoye.charAt(0).toUpperCase() + nomNettoye.slice(1);
    
    bouton.textContent = nomNettoye;
    bouton.addEventListener('click', () => playSound(fichier));
    grid.appendChild(bouton);
});

function playSound(nomDuFichier) {
    const audio = new Audio('sons/' + nomDuFichier);
    audio.play();
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log("Service Worker prêt !"))
        .catch(err => console.log("Erreur :", err));
}