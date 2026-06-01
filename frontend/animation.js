let steps = [];
let currentStep = 0;
let isPlaying = false;
let timer = null;
let trackNames = [];
const DELAY = 900;

function initVisualizer(stepList, names) {
    steps = stepList;
    trackNames = names;
    currentStep = 0;
    isPlaying = false;
    renderControls();
    renderStep(steps[0]);
}

function renderControls() {
    const section = document.getElementById('visualizer-section');
    section.innerHTML = `
    <div class="viz-controls">
      <button id="btn-prev"  onclick="prevStep()">&#9664;</button>
      <button id="btn-play"  onclick="togglePlay()">&#9654; Play</button>
      <button id="btn-next"  onclick="nextStep()">&#9654;&#9654;</button>
      <span id="step-counter">Passo 1 / ${steps.length}</span>
    </div>
    <div id="viz-stage" class="viz-stage"></div>
    <div id="viz-description" class="viz-description"></div>
    <div id="viz-inversions" class="viz-inversions">Inversões encontradas: 0</div>
  `;
}

function renderStep(step) {
    const stage = document.getElementById('viz-stage');
    const desc = document.getElementById('viz-description');
    const invCount = document.getElementById('viz-inversions');
    const counter = document.getElementById('step-counter');

    counter.textContent = `Passo ${currentStep + 1} / ${steps.length}`;

    stage.innerHTML = '';

    if (step.type === 'split') {
        desc.textContent = `Dividindo em dois grupos`;
        renderGroup(step.left, stage, 'group-left', 'neutral');
        renderDivider(stage);
        renderGroup(step.right, stage, 'group-right', 'neutral');

    } else if (step.type === 'compare') {
        const color = step.isInversion ? 'inversion' : 'ok';
        desc.textContent = step.isInversion
            ? `Inversão! "${getName(step.left)}" deveria vir antes de "${getName(step.right)}" (+${step.inversionsAdded})`
            : `Ok — "${getName(step.left)}" está antes de "${getName(step.right)}"`;
        renderCard(step.left, stage, 'comparing', color);
        renderCard(step.right, stage, 'comparing', color);

    } else if (step.type === 'merge') {
        desc.textContent = `Sublista ordenada (${step.inversions} inversões acumuladas)`;
        renderGroup(step.result, stage, 'group-merged', 'merged');
        invCount.textContent = `Inversões encontradas: ${step.inversions}`;
    }
}

function renderGroup(indices, container, className, state) {
    const group = document.createElement('div');
    group.className = `viz-group ${className}`;
    indices.forEach(idx => renderCard(idx, group, '', state));
    container.appendChild(group);
}

function renderCard(idx, container, extraClass, state) {
    const card = document.createElement('div');
    card.className = `viz-card ${state} ${extraClass}`;
    card.innerHTML = `
    <span class="viz-pos">#${idx + 1}</span>
    <span class="viz-name">${getName(idx)}</span>
  `;
    container.appendChild(card);
}

function renderDivider(container) {
    const div = document.createElement('div');
    div.className = 'viz-divider';
    div.textContent = '÷';
    container.appendChild(div);
}

function getName(idx) {
    return trackNames[idx] ?? `Faixa ${idx + 1}`;
}

function nextStep() {
    if (currentStep < steps.length - 1) {
        currentStep++;
        renderStep(steps[currentStep]);
    } else {
        stopPlay();
    }
}

function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        renderStep(steps[currentStep]);
    }
}

function togglePlay() {
    isPlaying ? stopPlay() : startPlay();
}

function startPlay() {
    isPlaying = true;
    document.getElementById('btn-play').textContent = '⏸ Pausar';
    timer = setInterval(() => {
        if (currentStep < steps.length - 1) {
            nextStep();
        } else {
            stopPlay();
        }
    }, DELAY);
}

function stopPlay() {
    isPlaying = false;
    clearInterval(timer);
    const btn = document.getElementById('btn-play');
    if (btn) btn.textContent = '▶ Play';
}