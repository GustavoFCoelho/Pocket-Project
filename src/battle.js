import './battle.css';

const creatures = {
  mossbit: {
    key: 'mossbit',
    name: 'Mossbit',
    type: 'Bosque',
    sprite: 'mossbit',
    maxHp: 32,
    color: '#7fd09b',
    moves: [
      { name: 'Folha Rápida', kind: 'leaf', damage: 8, label: 'FOLHA' },
      { name: 'Investida', kind: 'tackle', damage: 6, label: 'NORMAL' },
    ],
  },
  cindercub: {
    key: 'cindercub',
    name: 'Cindercub',
    type: 'Brasa',
    sprite: 'cindercub',
    maxHp: 30,
    color: '#ff9b62',
    moves: [
      { name: 'Faísca Solar', kind: 'ember', damage: 8, label: 'BRASA' },
      { name: 'Pulo Feroz', kind: 'tackle', damage: 6, label: 'NORMAL' },
    ],
  },
};

const cindercubSvg = `<svg class="cindercub-art" viewBox="0 0 32 32" role="img" aria-label="Cindercub, criatura de brasa">
  <g shape-rendering="crispEdges">
    <path fill="#6a342d" d="M7 7h4V3h4v5h-4v4H7zm14 1h4V4h4v7h-4v3h-4z"/>
    <path fill="#d76547" d="M8 12h4V8h4v3h5V8h4v5h3v9h-3v5h-5v2h-7v-2h-5v-4H6v-9h2z"/>
    <path fill="#f49a5f" d="M11 13h4v3h-4zm10 0h4v3h-4zM12 19h10v4h-3v2h-5v-2h-2z"/>
    <path fill="#fff1c9" d="M13 13h2v2h-2zm10 0h2v2h-2z"/>
    <path fill="#382a2b" d="M14 14h1v2h-1zm10 0h1v2h-1zM17 20h4v1h-4z"/>
    <path fill="#f4c56f" d="M5 16h2v4H5zm20-7h3V6h2v7h-5zM10 25h4v3h-4zm11 0h4v3h-4z"/>
    <path fill="#fff1c9" d="M15 26h5v2h-5z"/>
  </g>
</svg>`;

function renderSprite(creature, isPlayer) {
  if (creature.key === 'mossbit') {
    const url = `${import.meta.env.BASE_URL}sprites/mossbit.png`;
    return `<img class="creature-art mossbit-art" src="${url}" alt="Mossbit">`;
  }
  return cindercubSvg;
}

export function createBattleSystem({ showToast }) {
  const root = document.querySelector('#game');
  let active = false;
  let busy = false;
  let turn = 0;
  let enemyIndex = 1;
  let party = creatures.mossbit ? [creatures.mossbit, creatures.cindercub] : [];
  let playerIndex = 0;
  let playerHp = party.map((creature) => creature.maxHp);
  let enemy = creatures.cindercub;
  let enemyHp = enemy.maxHp;
  let didWin = false;

  const overlay = document.createElement('section');
  overlay.className = 'battle-screen';
  overlay.setAttribute('aria-label', 'Batalha');
  overlay.setAttribute('aria-live', 'polite');
  overlay.hidden = true;
  root.appendChild(overlay);

  function currentCreature() { return party[playerIndex]; }
  function healthMarkup(id, name, type, hp, maxHp, right = false) {
    const percent = Math.max(0, Math.min(100, (hp / maxHp) * 100));
    return `<div class="battle-status ${right ? 'enemy-status' : 'player-status'}">
      <div class="status-heading"><strong>${name}</strong><span>${type}</span></div>
      <div class="hp-track"><i id="${id}" style="width:${percent}%"></i></div>
      <small class="hp-numbers"><b id="${id}-value">${hp}</b> / ${maxHp} PV</small>
    </div>`;
  }

  function render() {
    if (!active) return;
    const player = currentCreature();
    overlay.innerHTML = `
      <div class="battle-topline"><span>ENCONTRO SELVAGEM</span><button class="battle-close" type="button" data-action="run" aria-label="Fugir">×</button></div>
      <div class="battle-field">
        <div class="battle-creature enemy-side" id="enemy-creature">
          <div class="creature-aura aura-enemy"></div>
          <div class="creature-shadow"></div>
          ${renderSprite(enemy, false)}
          <span class="creature-level">Nv. 3</span>
        </div>
        ${healthMarkup('enemy-hp', enemy.name, enemy.type, enemyHp, enemy.maxHp, true)}
        <div class="battle-creature player-side" id="player-creature">
          <div class="creature-aura aura-player"></div>
          <div class="creature-shadow"></div>
          ${renderSprite(player, true)}
          <span class="creature-level">Nv. 3</span>
        </div>
        ${healthMarkup('player-hp', player.name, player.type, playerHp[playerIndex], player.maxHp)}
        <div class="battle-effects" id="battle-effects" aria-hidden="true"></div>
      </div>
      <div class="battle-panel">
        <div class="battle-message" id="battle-message">Um ${enemy.name} selvagem apareceu!</div>
        <div class="battle-actions">
          <div class="party-switch" aria-label="Escolha sua criatura">
            ${party.map((creature, index) => `<button type="button" class="party-chip ${index === playerIndex ? 'selected' : ''}" data-party="${index}" ${playerHp[index] <= 0 ? 'disabled' : ''}>${creature.name}<small>${playerHp[index]}/${creature.maxHp}</small></button>`).join('')}
          </div>
          <div class="move-grid">
            ${player.moves.map((move, index) => `<button class="move-button move-${move.kind}" type="button" data-move="${index}" ${busy ? 'disabled' : ''}><span>${move.name}</span><small>${move.label}</small></button>`).join('')}
          </div>
        </div>
      </div>`;
    overlay.querySelectorAll('[data-move]').forEach((button) => button.addEventListener('click', () => attack(Number(button.dataset.move))));
    overlay.querySelectorAll('[data-party]').forEach((button) => button.addEventListener('click', () => switchCreature(Number(button.dataset.party))));
    overlay.querySelector('[data-action="run"]').addEventListener('click', runAway);
  }

  function setMessage(text) {
    const message = overlay.querySelector('#battle-message');
    if (message) message.textContent = text;
  }

  function updateHp(side, hp, maxHp) {
    const bar = overlay.querySelector(`#${side}-hp`);
    const value = overlay.querySelector(`#${side}-hp-value`);
    if (bar) bar.style.width = `${Math.max(0, hp / maxHp * 100)}%`;
    if (value) value.textContent = hp;
  }

  function effect(kind, target) {
    const el = overlay.querySelector(`#${target}-creature`);
    const field = overlay.querySelector('#battle-effects');
    if (!el || !field) return;
    el.classList.remove('is-attacking', 'is-hit');
    field.className = 'battle-effects';
    void el.offsetWidth;
    el.classList.add(kind === 'hit' ? 'is-hit' : 'is-attacking');
    field.classList.add(`effect-${kind}`, `effect-on-${target}`);
    window.setTimeout(() => {
      el.classList.remove('is-attacking', 'is-hit');
      field.className = 'battle-effects';
    }, 700);
  }

  function finish(won) {
    busy = false;
    didWin = won;
    if (won) setMessage(`${enemy.name} se acalmou. Você venceu!`);
    else setMessage(`${currentCreature().name} não consegue continuar.`);
    overlay.querySelectorAll('.move-button, .party-chip').forEach((button) => { button.disabled = true; });
    const action = document.createElement('button');
    action.className = 'battle-finish';
    action.textContent = won ? 'Voltar à trilha' : 'Encerrar batalha';
    action.addEventListener('click', close);
    overlay.querySelector('.battle-actions').appendChild(action);
  }

  function enemyTurn() {
    if (enemyHp <= 0) { finish(true); return; }
    const target = currentCreature();
    const damage = enemy.moves[(turn + 1) % enemy.moves.length].damage - Math.floor(Math.random() * 2);
    setMessage(`${enemy.name} usou ${enemy.moves[(turn + 1) % enemy.moves.length].name}!`);
    effect('hit', 'player');
    playerHp[playerIndex] = Math.max(0, playerHp[playerIndex] - damage);
    window.setTimeout(() => {
      updateHp('player', playerHp[playerIndex], target.maxHp);
      if (playerHp[playerIndex] <= 0) {
        const next = party.findIndex((creature, index) => index !== playerIndex && playerHp[index] > 0);
        if (next >= 0) {
          playerIndex = next;
          setMessage(`${target.name} voltou. ${party[next].name}, sua vez!`);
          window.setTimeout(render, 500);
        } else finish(false);
        return;
      }
      busy = false;
      render();
      setMessage(`${target.name} sofreu ${damage} de dano. Sua vez!`);
    }, 620);
  }

  function attack(moveIndex) {
    if (!active || busy) return;
    const attacker = currentCreature();
    const move = attacker.moves[moveIndex];
    if (!move) return;
    busy = true;
    setMessage(`${attacker.name} usou ${move.name}!`);
    effect(move.kind, 'enemy');
    const damage = move.damage + Math.floor(Math.random() * 3);
    enemyHp = Math.max(0, enemyHp - damage);
    window.setTimeout(() => {
      updateHp('enemy', enemyHp, enemy.maxHp);
      if (enemyHp <= 0) { finish(true); return; }
      turn += 1;
      enemyTurn();
    }, 520);
  }

  function switchCreature(index) {
    if (!active || busy || index === playerIndex || playerHp[index] <= 0) return;
    const previous = currentCreature();
    playerIndex = index;
    busy = true;
    setMessage(`${previous.name}, volte! ${currentCreature().name}, vamos!`);
    effect('hit', 'player');
    window.setTimeout(() => {
      busy = false;
      render();
      setMessage(`${currentCreature().name} está pronto para lutar!`);
    }, 430);
  }

  function runAway() {
    if (!active || busy) return;
    close();
    showToast('Você voltou para a trilha.');
  }

  function start() {
    if (active) return;
    active = true;
    busy = false;
    turn = 0;
    playerIndex = playerHp.findIndex((hp) => hp > 0);
    if (playerIndex < 0) { playerHp = party.map((creature) => creature.maxHp); playerIndex = 0; }
    enemy = Math.random() < 0.5 ? creatures.cindercub : creatures.mossbit;
    enemyHp = enemy.maxHp;
    overlay.hidden = false;
    render();
  }

  function close() {
    active = false;
    busy = false;
    overlay.hidden = true;
    showToast(didWin ? 'Boa batalha! A trilha espera por você.' : 'Batalha encerrada.');
  }

  return { start, isActive: () => active };
}
