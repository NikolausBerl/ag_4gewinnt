/**
 * Vier Gewinnt Deluxe — Spiellogik & UI-Controller
 */

class SoundController {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playDrop(row) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // Tonhöhe steigt, je tiefer der Stein fällt
    const baseFreq = 220 + (5 - row) * 45;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.13);
  }

  playPop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  playWin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // Freudiger Dreiklang
    const notes = [392.00, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + idx * 0.11;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.36);
    });
  }

  playDraw() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [300, 260, 220];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + idx * 0.14;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.26);
    });
  }
}

class ConnectFourGame {
  constructor() {
    this.ROWS = 6;
    this.COLS = 7;
    
    this.ai = new ConnectFourAI();
    this.sound = new SoundController();

    // Spielstatus
    this.board = this.createEmptyBoard();
    this.currentPlayer = 1; // 1 = Rot (Spieler 1), 2 = Gelb (Spieler 2 oder KI)
    this.gameMode = 'pvc';  // 'pvc' oder 'pvp'
    this.difficulty = 2;    // 1-4
    this.gameOver = false;
    this.isAiTurn = false;
    this.winningLine = null;
    this.history = [];      // Für Undo

    // Bonus-Regeln
    this.popOutEnabled = false;
    this.obstaclesEnabled = false;
    this.obstacles = [];    // Koordinaten [ [r,c], ... ]

    // Match-Statistiken
    this.stats = {
      rounds: 0,
      p1Wins: 0,
      p2Wins: 0,
      draws: 0,
      currentMoves: 0
    };

    this.initDOMElements();
    this.bindEvents();
    this.renderBoard();
    this.updateUI();
  }

  createEmptyBoard() {
    return Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
  }

  initDOMElements() {
    this.boardGridEl = document.getElementById('board-grid');
    this.colSelectorsEl = document.getElementById('column-selectors');
    this.turnIndicatorEl = document.getElementById('turn-indicator');
    this.turnTextEl = document.getElementById('turn-text');
    this.p1HudEl = document.getElementById('p1-hud');
    this.p2HudEl = document.getElementById('p2-hud');
    this.p1ScoreEl = document.getElementById('p1-score');
    this.p2ScoreEl = document.getElementById('p2-score');
    this.p2NameEl = document.getElementById('p2-name');

    this.aiThinkingEl = document.getElementById('ai-thinking');
    this.algoDepthEl = document.getElementById('algo-depth');
    this.algoNodesEl = document.getElementById('algo-nodes');
    this.algoTimeEl = document.getElementById('algo-time');

    this.statRoundsEl = document.getElementById('stat-rounds');
    this.statDrawsEl = document.getElementById('stat-draws');
    this.statMovesEl = document.getElementById('stat-moves');

    this.popoutBarEl = document.getElementById('popout-bar');
    this.popoutButtonsEl = document.getElementById('popout-buttons');

    this.rulesModalEl = document.getElementById('rules-modal');
    this.gameOverOverlayEl = document.getElementById('gameover-overlay');
    this.winnerIconEl = document.getElementById('winner-icon');
    this.winnerTitleEl = document.getElementById('winner-title');
    this.winnerSubEl = document.getElementById('winner-sub');

    this.btnSoundEl = document.getElementById('btn-sound');
    this.soundIconEl = document.getElementById('sound-icon');
    this.togglePopoutEl = document.getElementById('toggle-popout');
    this.toggleObstaclesEl = document.getElementById('toggle-obstacles');
  }

  bindEvents() {
    // Spalten-Drop Buttons
    this.colSelectorsEl.addEventListener('click', (e) => {
      if (e.target.classList.contains('col-btn')) {
        const col = parseInt(e.target.getAttribute('data-col'), 10);
        this.handlePlayerAction('drop', col);
      }
    });

    // Klick direkt auf das Board
    this.boardGridEl.addEventListener('click', (e) => {
      const slot = e.target.closest('.slot');
      if (slot) {
        const col = parseInt(slot.getAttribute('data-col'), 10);
        this.handlePlayerAction('drop', col);
      }
    });

    // Pop-Out Buttons
    this.popoutButtonsEl.addEventListener('click', (e) => {
      if (e.target.classList.contains('pop-btn')) {
        const col = parseInt(e.target.getAttribute('data-col'), 10);
        this.handlePlayerAction('pop', col);
      }
    });

    // Spielmodus Umschalter
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.gameMode = btn.getAttribute('data-mode');
        
        const aiCard = document.getElementById('ai-settings-card');
        if (this.gameMode === 'pvc') {
          aiCard.style.display = 'block';
          this.p2NameEl.textContent = 'Computer (Gelb)';
        } else {
          aiCard.style.display = 'none';
          this.p2NameEl.textContent = 'Spieler 2 (Gelb)';
        }
        this.restartGame();
      });
    });

    // Schwierigkeitsstufen Buttons
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.difficulty = parseInt(btn.getAttribute('data-diff'), 10);
        this.updateAlgoDepthDisplay();
      });
    });

    // Bonus Toggles
    this.togglePopoutEl.addEventListener('change', (e) => {
      this.popOutEnabled = e.target.checked;
      this.popoutBarEl.style.display = this.popOutEnabled ? 'flex' : 'none';
      this.updatePopOutButtons();
    });

    this.toggleObstaclesEl.addEventListener('change', (e) => {
      this.obstaclesEnabled = e.target.checked;
      this.restartGame();
    });

    // Buttons: Neu, Undo, Regeln
    document.getElementById('btn-restart').addEventListener('click', () => this.restartGame());
    document.getElementById('btn-play-again').addEventListener('click', () => {
      this.gameOverOverlayEl.style.display = 'none';
      this.restartGame();
    });
    document.getElementById('btn-undo').addEventListener('click', () => this.undoLastMove());

    // Sound Button
    this.btnSoundEl.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      this.soundIconEl.textContent = this.sound.enabled ? '🔊' : '🔇';
    });

    // Regeln Modal
    document.getElementById('btn-rules').addEventListener('click', () => {
      this.rulesModalEl.style.display = 'flex';
    });
    document.getElementById('btn-close-modal').addEventListener('click', () => {
      this.rulesModalEl.style.display = 'none';
    });
    document.getElementById('btn-close-modal-footer').addEventListener('click', () => {
      this.rulesModalEl.style.display = 'none';
    });
  }

  restartGame() {
    this.board = this.createEmptyBoard();
    this.currentPlayer = 1;
    this.gameOver = false;
    this.isAiTurn = false;
    this.winningLine = null;
    this.history = [];
    this.stats.currentMoves = 0;

    // Hindernisse platzieren (falls aktiv)
    this.obstacles = [];
    if (this.obstaclesEnabled) {
      // Platziere 2 Hindernisse in den Zeilen 1-4 (nicht ganz unten, nicht ganz oben)
      const possiblePositions = [
        [2, 2], [2, 4], [3, 1], [3, 5], [4, 3], [3, 3]
      ].sort(() => Math.random() - 0.5);

      this.obstacles = [possiblePositions[0], possiblePositions[1]];
      for (const [r, c] of this.obstacles) {
        this.board[r][c] = -1; // -1 = Hindernis
      }
    }

    this.renderBoard();
    this.updateUI();
  }

  renderBoard() {
    this.boardGridEl.innerHTML = '';
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.setAttribute('data-row', r);
        slot.setAttribute('data-col', c);

        const val = this.board[r][c];
        if (val !== 0) {
          const disc = document.createElement('div');
          disc.className = 'disc';
          if (val === 1) disc.classList.add('player1');
          else if (val === 2) disc.classList.add('player2');
          else if (val === -1) disc.classList.add('obstacle');

          // Gewinn-Hervorhebung prüfen
          if (this.winningLine && this.winningLine.some(([wr, wc]) => wr === r && wc === c)) {
            disc.classList.add('winning');
          }

          slot.appendChild(disc);
        }

        this.boardGridEl.appendChild(slot);
      }
    }

    this.updateColButtons();
    this.updatePopOutButtons();
  }

  handlePlayerAction(action, col) {
    if (this.gameOver || this.isAiTurn) return;

    let moveSuccess = false;

    if (action === 'drop') {
      moveSuccess = this.executeDrop(col, this.currentPlayer);
    } else if (action === 'pop' && this.popOutEnabled) {
      moveSuccess = this.executePopOut(col, this.currentPlayer);
    }

    if (!moveSuccess) return;

    this.stats.currentMoves++;
    this.updateUI();

    // Auf Spielende prüfen
    const winner = this.ai.checkWin(this.board);
    if (winner) {
      this.handleGameOver(winner);
      return;
    }

    if (this.ai.isBoardFull(this.board)) {
      this.handleGameOver(0); // Unentschieden
      return;
    }

    // Spielerwechsel
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    this.updateUI();

    // KI-Zug auslösen falls Modus PvC
    if (this.gameMode === 'pvc' && this.currentPlayer === 2) {
      this.triggerAiMove();
    }
  }

  executeDrop(col, player, isAnimated = true) {
    const targetRow = this.ai.getDropRow(this.board, col);
    if (targetRow === -1) return false; // Spalte voll oder oben blockiert

    // Zustand für Undo speichern
    this.saveHistoryState();

    this.board[targetRow][col] = player;
    this.renderBoard();

    // Fall-Animation & Sound
    if (isAnimated) {
      this.sound.playDrop(targetRow);
      const slot = this.getSlotElement(targetRow, col);
      const disc = slot ? slot.querySelector('.disc') : null;
      if (disc) disc.classList.add('anim-drop');
    }

    return true;
  }

  executePopOut(col, player) {
    if (this.board[this.ROWS - 1][col] !== player) return false;

    this.saveHistoryState();

    // Untersten Stein entfernen und alle oberen nachrutschen lassen
    for (let r = this.ROWS - 1; r > 0; r--) {
      // Wenn darüber ein Hindernis liegt, bleibt das Hindernis fixiert
      if (this.board[r - 1][col] === -1) {
        // Hindernis fällt nicht, aber Steine darüber schon
        continue;
      }
      this.board[r][col] = this.board[r - 1][col];
    }
    this.board[0][col] = 0;

    this.sound.playPop();
    this.renderBoard();
    return true;
  }

  triggerAiMove() {
    this.isAiTurn = true;
    this.aiThinkingEl.style.display = 'flex';
    this.turnTextEl.textContent = 'KI überlegt...';

    // Kleines Timeout, damit der Mensch den Zug animiert sieht und das UI nicht blockiert
    const delay = this.difficulty === 1 ? 250 : (this.difficulty === 2 ? 350 : 450);

    setTimeout(() => {
      const best = this.ai.getBestMove(this.board, this.difficulty, this.popOutEnabled);

      // Statistiken im UI aktualisieren
      this.algoNodesEl.textContent = best.nodes.toLocaleString();
      this.algoTimeEl.textContent = `${best.timeMs} ms`;

      let success = false;
      if (best.action === 'pop') {
        success = this.executePopOut(best.column, 2);
      } else {
        success = this.executeDrop(best.column, 2);
      }

      this.isAiTurn = false;
      this.aiThinkingEl.style.display = 'none';

      this.stats.currentMoves++;
      this.updateUI();

      const winner = this.ai.checkWin(this.board);
      if (winner) {
        this.handleGameOver(winner);
        return;
      }

      if (this.ai.isBoardFull(this.board)) {
        this.handleGameOver(0);
        return;
      }

      this.currentPlayer = 1;
      this.updateUI();
    }, delay);
  }

  handleGameOver(winner) {
    this.gameOver = true;
    this.stats.rounds++;

    if (winner === 1) {
      this.stats.p1Wins++;
      this.winningLine = this.ai.findWinningLine(this.board);
      this.sound.playWin();
      this.showGameOverModal('🏆', 'Rot hat gewonnen!', 'Hervorragend gespielt!');
    } else if (winner === 2) {
      this.stats.p2Wins++;
      this.winningLine = this.ai.findWinningLine(this.board);
      this.sound.playWin();
      const p2Label = this.gameMode === 'pvc' ? 'Die KI (Gelb)' : 'Gelb';
      this.showGameOverModal('🤖', `${p2Label} hat gewonnen!`, 'Ein genialer Schachzug der KI.');
    } else {
      this.stats.draws++;
      this.sound.playDraw();
      this.showGameOverModal('🤝', 'Unentschieden!', 'Das gesamte Spielfeld ist voll.');
    }

    this.renderBoard();
    this.updateUI();
  }

  showGameOverModal(icon, title, subtitle) {
    this.winnerIconEl.textContent = icon;
    this.winnerTitleEl.textContent = title;
    this.winnerSubEl.textContent = subtitle;
    setTimeout(() => {
      this.gameOverOverlayEl.style.display = 'flex';
    }, 600);
  }

  saveHistoryState() {
    this.history.push({
      board: this.board.map(r => [...r]),
      currentPlayer: this.currentPlayer,
      moves: this.stats.currentMoves
    });
  }

  undoLastMove() {
    if (this.history.length === 0 || this.gameOver || this.isAiTurn) return;

    // Im PvC Modus: Nimm 2 Züge zurück (KI + Mensch), es sei denn Mensch hat gerade verloren
    const stepsToUndo = (this.gameMode === 'pvc' && this.history.length >= 2) ? 2 : 1;

    for (let i = 0; i < stepsToUndo; i++) {
      if (this.history.length > 0) {
        const lastState = this.history.pop();
        this.board = lastState.board;
        this.currentPlayer = lastState.currentPlayer;
        this.stats.currentMoves = lastState.moves;
      }
    }

    this.renderBoard();
    this.updateUI();
  }

  updateUI() {
    // HUD
    if (this.currentPlayer === 1) {
      this.p1HudEl.classList.add('active');
      this.p2HudEl.classList.remove('active');
      this.turnTextEl.textContent = 'Rot ist am Zug';
    } else {
      this.p1HudEl.classList.remove('active');
      this.p2HudEl.classList.add('active');
      this.turnTextEl.textContent = this.gameMode === 'pvc' ? 'Computer ist am Zug' : 'Gelb ist am Zug';
    }

    this.p1ScoreEl.textContent = `${this.stats.p1Wins} Siege`;
    this.p2ScoreEl.textContent = `${this.stats.p2Wins} Siege`;

    // Statistiken
    this.statRoundsEl.textContent = this.stats.rounds;
    this.statDrawsEl.textContent = this.stats.draws;
    this.statMovesEl.textContent = this.stats.currentMoves;

    this.updateAlgoDepthDisplay();
    this.updateColButtons();
    this.updatePopOutButtons();
  }

  updateAlgoDepthDisplay() {
    const depths = { 1: '1 Zug (Anfänger)', 2: '3 Züge (Fortgeschritten)', 3: '5 Züge (Taktiker)', 4: '7+ Züge (Meister)' };
    this.algoDepthEl.textContent = depths[this.difficulty] || '3 Züge';
  }

  updateColButtons() {
    const buttons = this.colSelectorsEl.querySelectorAll('.col-btn');
    buttons.forEach((btn, col) => {
      const isFull = this.board[0][col] !== 0;
      if (isFull) {
        btn.classList.add('col-full');
        btn.disabled = true;
      } else {
        btn.classList.remove('col-full');
        btn.disabled = false;
      }
    });
  }

  updatePopOutButtons() {
    if (!this.popOutEnabled) return;
    const buttons = this.popoutButtonsEl.querySelectorAll('.pop-btn');
    buttons.forEach((btn, col) => {
      const bottomCell = this.board[this.ROWS - 1][col];
      // Nur aktiv, wenn der unterste Stein dem aktuellen Spieler gehört
      const canPop = (bottomCell === this.currentPlayer);
      btn.disabled = !canPop;
    });
  }

  getSlotElement(row, col) {
    return this.boardGridEl.querySelector(`.slot[data-row="${row}"][data-col="${col}"]`);
  }
}

// Initialisierung bei DOM-Bereitschaft
window.addEventListener('DOMContentLoaded', () => {
  window.game = new ConnectFourGame();
});
