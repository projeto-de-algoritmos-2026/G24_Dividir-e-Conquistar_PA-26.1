let albumData = null;

// carrega o array com as musicas listadas do album no json
async function loadAlbum() {
    const response = await fetch('../backend/ranking.json');
    albumData = await response.json();

    return albumData;
}