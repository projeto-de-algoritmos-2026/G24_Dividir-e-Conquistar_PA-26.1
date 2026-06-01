let albumData = null;

// carrega o array com as musicas listadas do album no json
async function loadAlbum() {
    const response = await fetch('../backend/ranking.json');
    albumData = await response.json();

    return albumData;
}

// embaralha a ordem "correta" do rank
function shuffle(z) {
    const array = { ...z };

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}