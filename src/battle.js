import './battle.css';
import mossbitArt from './assets/mossbit-battle.b64?raw';
import cindercubArt from './assets/cindercub.b64?raw';

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

function renderSprite(creature) {
  const image = creature.key === 'mossbit' ? mossbitArt.trim() : cindercubArt.trim();
  return `<img class="creature-art ${creature.key}-art" src="data:image/png;base64,${image}" alt="${creature.name}">`;
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
          ${renderSprite(enemy)}
          <span class="creature-level">Nv. 3</span>
        </div>
        ${healthMarkup('enemy-hp', enemy.name, enemy.type, enemyHp, enemy.maxHp, true)}
        <div class="battle-creature player-side" id="player-creature">
          <div class="creature-aura aura-player"></div>
          <div class="creature-shadow"></div>
          ${renderSprite(player)}
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
    if (kind !== 'hit') el.classList.add(`attack-${kind}`);
    field.classList.add(`effect-${kind}`, `effect-on-${target}`);
    window.setTimeout(() => {
      el.classList.remove('is-attacking', 'is-hit', 'attack-leaf', 'attack-ember', 'attack-tackle');
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
