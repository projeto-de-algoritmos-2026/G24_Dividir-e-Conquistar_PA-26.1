const userRank = [];

// inicia as musicas
async function init() {
    const data = await loadAlbum();
    renderAvailable(data.tracks);
}

// renderiza as musicas na lista do front
function renderAvailable(tracks) {
    const container = document.getElementById('available-songs');
    container.innerHTML = '';

    tracks.forEach(track => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.dataset.id = track.id;
        card.innerHTML = `
      <span class="song-position">—</span>
      <span class="song-title">${track.title}</span>
    `;
        card.onclick = () => selectSong(track);
        container.appendChild(card);
    });
}


function selectSong(track) {
    userRank.push(track.id);
    updateRankingPanel();
    updateProgress();

    // remove da lista disponível
    const card = document.querySelector(`[data-id="${track.id}"]`);
    card.classList.add('selected');
    card.onclick = null;

    if (userRank.length === albumData.tracks.length) {
        document.getElementById('btn-calculate').classList.remove('disabled');
        document.getElementById('btn-calculate').disabled = false;
    }
}

function updateRankingPanel() {
    const container = document.getElementById('user-ranking');
    const placeholder = document.getElementById('ranking-placeholder');

    if (placeholder) {
        placeholder.style.display = 'none';
    }
    container.innerHTML = '';

    userRank.forEach((id, index) => {
        const track = albumData.tracks.find(t => t.id === id);
        const card = document.createElement('div');
        card.className = 'song-card ranked';
        card.innerHTML = `
      <span class="song-position">${index + 1}</span>
      <span class="song-title">${track.title}</span>
    `;
        container.appendChild(card);
    });
}

function updateProgress() {
    const total = albumData.tracks.length;
    const done = userRank.length;
    const pct = (done / total) * 100;

    document.getElementById('progress-bar').style.width = `${pct}%`;
    document.getElementById('progress-label').textContent = `${done} / ${total} selecionadas`;
}

function resetRanking() {
    userRank.length = 0;
    renderAvailable(albumData.tracks);
    document.getElementById('user-ranking').innerHTML = `
    <div class="ranking-placeholder" id="ranking-placeholder">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
      <span>Clique nas músicas ao lado para montar o seu ranking</span>
    </div>`;
    updateProgress();
    document.getElementById('btn-calculate').classList.add('disabled');
    document.getElementById('btn-calculate').disabled = true;
}

function calculateAffinity() {
    // 1. Get inversion counts and steps
    const { steps, inversions } = countInversionsWithSteps(userRank, albumData.goalRank);
    const similarity = calcSimilarity(userRank, albumData.goalRank);

    // 2. Hide ranking and show results section
    document.getElementById('ranking-section').classList.remove('active');
    document.getElementById('results-section').classList.add('active');

    // 3. Set up visualizer
    const namesSortedByGoal = albumData.goalRank.map(id => {
        return albumData.tracks.find(t => t.id === id).title;
    });
    initVisualizer(steps, namesSortedByGoal);

    // 4. Animate the score ring fill
    const ringFill = document.getElementById('score-ring-fill');
    if (ringFill) {
        ringFill.style.strokeDashoffset = 534 - (similarity / 100) * 534;
    }

    // 5. Animate score number counter
    let currentScore = 0;
    const scoreNumber = document.getElementById('score-number');
    if (scoreNumber) {
        scoreNumber.textContent = '0%';
        const interval = setInterval(() => {
            if (currentScore >= similarity) {
                scoreNumber.textContent = `${similarity}%`;
                clearInterval(interval);
            } else {
                currentScore++;
                scoreNumber.textContent = `${currentScore}%`;
            }
        }, 15);
    }

    // 6. Set qualitative messages
    let title = "";
    let message = "";

    if (similarity >= 90) {
        title = "Almas Gêmeas Musicais!";
        message = "Seu gosto é perfeitamente alinhado com o gabarito oficial! Uma afinidade incrível.";
    } else if (similarity >= 70) {
        title = "Ótima Conexão!";
        message = "Vocês compartilham de preferências extremamente parecidas. Têm muito em comum!";
    } else if (similarity >= 50) {
        title = "Boa Afinidade!";
        message = "Algumas escolhas são idênticas, mas outras divergem. Vocês ainda têm um bom papo sobre música!";
    } else if (similarity >= 30) {
        title = "Gostos Distintos...";
        message = "Você tem uma visão única do álbum. Embora haja pontos em comum, suas preferências seguem outro caminho.";
    } else {
        title = "Opostos Musicais!";
        message = "Gostos completamente diferentes! Mas não se preocupe, os opostos se atraem e a variedade faz a música ser incrível.";
    }

    const titleEl = document.getElementById('result-title');
    const msgEl = document.getElementById('result-message');
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;

    // 7. Render stats
    const maxInversions = (userRank.length * (userRank.length - 1)) / 2;
    const invValueEl = document.getElementById('stat-inversions');
    const invDetailEl = document.getElementById('stat-inv-detail');
    if (invValueEl) invValueEl.textContent = inversions;
    if (invDetailEl) invDetailEl.textContent = `de ${maxInversions} possíveis`;

    let matches = 0;
    userRank.forEach((id, index) => {
        if (id === albumData.goalRank[index]) {
            matches++;
        }
    });

    const matchValueEl = document.getElementById('stat-matches');
    const matchDetailEl = document.getElementById('stat-match-detail');
    if (matchValueEl) matchValueEl.textContent = matches;
    if (matchDetailEl) matchDetailEl.textContent = `de ${userRank.length} músicas`;

    // 8. Render comparison table
    const tbody = document.getElementById('comparison-body');
    if (tbody) {
        tbody.innerHTML = '';
        for (let i = 0; i < userRank.length; i++) {
            const userSong = albumData.tracks.find(t => t.id === userRank[i]);
            const goalSong = albumData.tracks.find(t => t.id === albumData.goalRank[i]);
            const isMatch = userRank[i] === albumData.goalRank[i];

            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td class="table-pos">#${i + 1}</td>
              <td>
                <div class="table-song">
                  <span class="table-song-title">${userSong ? userSong.title : '—'}</span>
                </div>
              </td>
              <td>
                <div class="table-song">
                  <span class="table-song-title">${goalSong ? goalSong.title : '—'}</span>
                </div>
              </td>
              <td class="table-match">
                <span class="match-icon ${isMatch ? 'correct' : 'wrong'}">
                  ${isMatch ? '✓' : '✗'}
                </span>
              </td>
            `;
            tbody.appendChild(tr);
        }
    }
}

function restartTest() {
    stopPlay();
    resetRanking();
    document.getElementById('results-section').classList.remove('active');
    document.getElementById('ranking-section').classList.add('active');
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

init();
