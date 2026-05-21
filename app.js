// Fonction pour jouer un son
function playSound(nomDuFichier) {
    const audio = new Audio('Sons/' + nomDuFichier);
    audio.play();
}

// Enregistrement du Service Worker (pour le hors-ligne)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log("Service Worker enregistré avec succès !"))
        .catch(err => console.log("Erreur du Service Worker :", err));
}