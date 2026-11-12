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
    this.tutor = new ConnectFourTutor(this.ai);
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

    // Lernmodus & KI-Tutor
    this.learnMode = false;
    this.currentAnalysis = null;

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
    this.clearMovePreview();
    this.updateTutorUI();
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

    // Lernmodus & KI-Tutor Elemente
    this.btnLearnMode = document.getElementById('btn-learn-mode');
    this.learnModeStatus = document.getElementById('learn-mode-status');
    this.tutorQuickbar = document.getElementById('tutor-quickbar');
    this.tutorQuickMsg = document.getElementById('tutor-quick-msg');
    this.tutorCard = document.getElementById('tutor-card');
    this.tutorTeaserCard = document.getElementById('tutor-teaser-card');
    this.coachMoodIcon = document.getElementById('coach-mood-icon');
    this.coachMoodTitle = document.getElementById('coach-mood-title');
    this.coachText = document.getElementById('coach-text');
    this.bestMoveCol = document.getElementById('best-move-col');
    this.bestMoveTag = document.getElementById('best-move-tag');
    this.bestMoveReason = document.getElementById('best-move-reason');
    this.bestMoveBadge = document.getElementById('best-move-badge');
    this.tutorColList = document.getElementById('tutor-col-list');
    this.tutorStrategyTip = document.getElementById('tutor-strategy-tip');
    this.strategyModal = document.getElementById('strategy-modal');
    this.btnOpenStrategies = document.getElementById('btn-open-strategies');
    this.btnCloseStrategyModal = document.getElementById('btn-close-strategy-modal');
    this.btnCloseStrategyFooter = document.getElementById('btn-close-strategy-footer');
    this.btnActivateLearn = document.getElementById('btn-activate-learn');
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

    // Lernmodus & KI-Tutor Events
    if (this.btnLearnMode) {
      this.btnLearnMode.addEventListener('click', () => this.toggleLearnMode());
    }
    if (this.btnActivateLearn) {
      this.btnActivateLearn.addEventListener('click', () => this.toggleLearnMode(true));
    }

    // Tastenkürzel 'L' für schnelles Umschalten des Lernmodus
    window.addEventListener('keydown', (e) => {
      if ((e.key === 'l' || e.key === 'L') && !e.target.matches('input, textarea')) {
        this.toggleLearnMode();
      }
    });

    // Strategie Akademie Modal
    if (this.btnOpenStrategies) {
      this.btnOpenStrategies.addEventListener('click', () => {
        this.strategyModal.style.display = 'flex';
      });
    }
    if (this.btnCloseStrategyModal) {
      this.btnCloseStrategyModal.addEventListener('click', () => {
        this.strategyModal.style.display = 'none';
      });
    }
    if (this.btnCloseStrategyFooter) {
      this.btnCloseStrategyFooter.addEventListener('click', () => {
        this.strategyModal.style.display = 'none';
      });
    }

    // Klick auf den empfohlenen Zug führt ihn direkt aus
    if (this.bestMoveBadge) {
      this.bestMoveBadge.addEventListener('click', () => {
        if (this.currentAnalysis && this.currentAnalysis.bestMove && !this.gameOver && !this.isAiTurn) {
          const m = this.currentAnalysis.bestMove;
          this.handlePlayerAction(m.action, m.col);
        }
      });
    }

    // Hover über Spalten-Buttons zeigt taktische Vorschau auf dem Brett
    this.colSelectorsEl.addEventListener('mouseover', (e) => {
      const btn = e.target.closest('.col-btn');
      if (btn && this.learnMode) {
        const col = parseInt(btn.getAttribute('data-col'), 10);
        this.showMovePreview(col);
      }
    });
    this.colSelectorsEl.addEventListener('mouseleave', () => {
      if (this.learnMode) this.clearMovePreview();
    });

    // Hover über Slots auf dem Brett zeigt ebenfalls taktische Vorschau
    this.boardGridEl.addEventListener('mouseover', (e) => {
      const slot = e.target.closest('.slot');
      if (slot && this.learnMode) {
        const col = parseInt(slot.getAttribute('data-col'), 10);
        this.showMovePreview(col);
      }
    });
    this.boardGridEl.addEventListener('mouseleave', () => {
      if (this.learnMode) this.clearMovePreview();
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
    this.clearMovePreview();
    this.updateTutorUI();
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

    this.clearMovePreview();
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
    this.updateTutorUI();

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
    this.clearMovePreview();
    this.updateTutorUI();

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
      this.updateTutorUI();
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
    this.clearMovePreview();
    this.updateTutorUI();
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
    this.clearMovePreview();
    this.updateTutorUI();
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

  /**
   * Schaltet den Lernmodus mit KI-Tutor ein oder aus
   * @param {boolean} [explicitState]
   */
  toggleLearnMode(explicitState) {
    if (typeof explicitState === 'boolean') {
      this.learnMode = explicitState;
    } else {
      this.learnMode = !this.learnMode;
    }

    if (this.learnMode) {
      if (this.btnLearnMode) this.btnLearnMode.classList.add('active');
      if (this.learnModeStatus) this.learnModeStatus.textContent = 'AN';
      document.body.classList.add('learn-mode-on');
      if (this.tutorQuickbar) this.tutorQuickbar.style.display = 'flex';
      if (this.tutorCard) this.tutorCard.style.display = 'block';
      if (this.tutorTeaserCard) this.tutorTeaserCard.style.display = 'none';
      this.updateTutorUI();
    } else {
      if (this.btnLearnMode) this.btnLearnMode.classList.remove('active');
      if (this.learnModeStatus) this.learnModeStatus.textContent = 'AUS';
      document.body.classList.remove('learn-mode-on');
      if (this.tutorQuickbar) this.tutorQuickbar.style.display = 'none';
      if (this.tutorCard) this.tutorCard.style.display = 'none';
      if (this.tutorTeaserCard) this.tutorTeaserCard.style.display = 'block';
      this.clearMovePreview();
      this.clearColBadges();
    }
  }

  /**
   * Führt die KI-Tutor-Analyse aus und aktualisiert die UI-Elemente
   */
  updateTutorUI() {
    if (!this.learnMode) return;

    if (this.gameOver) {
      if (this.coachMoodIcon) this.coachMoodIcon.textContent = '🏁';
      if (this.coachMoodTitle) this.coachMoodTitle.textContent = 'Spiel beendet';
      if (this.coachText) this.coachText.textContent = 'Die Partie ist vorbei! Klicke auf "Neues Spiel", um das nächste Taktik-Training zu starten.';
      if (this.tutorQuickMsg) this.tutorQuickMsg.innerHTML = '<strong>Partie beendet.</strong> Bereit für die nächste Runde?';
      this.clearColBadges();
      return;
    }

    if (this.isAiTurn) {
      if (this.coachMoodIcon) this.coachMoodIcon.textContent = '⏳';
      if (this.coachMoodTitle) this.coachMoodTitle.textContent = 'KI rechnet...';
      if (this.coachText) this.coachText.textContent = 'Die KI überlegt ihren Zug. Beobachte aufmerksam, wie sie auf Bedrohungen reagiert und das Zentrum nutzt!';
      if (this.tutorQuickMsg) this.tutorQuickMsg.innerHTML = '<strong>Die KI ist am Zug...</strong> Gleich bist du wieder dran!';
      return;
    }

    // Taktische Analyse durchführen
    this.currentAnalysis = this.tutor.analyzeBoard(this.board, this.currentPlayer, this.popOutEnabled);
    const analysis = this.currentAnalysis;

    // 1. Spalten-Badges über den Drop-Buttons aktualisieren
    analysis.moves.forEach((m, c) => {
      const badgeEl = document.getElementById(`col-badge-${c}`);
      if (badgeEl) {
        if (m.isFull) {
          badgeEl.className = 'col-badge badge-full';
          badgeEl.textContent = '—';
        } else {
          badgeEl.className = `col-badge ${m.badgeClass}`;
          badgeEl.textContent = m.badge;
        }
      }
    });

    // 2. Coach-Sprechblase aktualisieren
    const coachMsg = analysis.coachMessage;
    if (this.coachMoodIcon) this.coachMoodIcon.textContent = coachMsg.icon;
    if (this.coachMoodTitle) this.coachMoodTitle.textContent = coachMsg.title;
    if (this.coachText) this.coachText.textContent = coachMsg.text;

    // 3. Best-Move Box
    const best = analysis.bestMove;
    if (best && !best.isFull) {
      if (this.bestMoveCol) this.bestMoveCol.textContent = `Spalte ${best.col + 1}`;
      if (this.bestMoveTag) {
        this.bestMoveTag.textContent = best.badge;
        this.bestMoveTag.className = `best-move-tag ${best.badgeClass}`;
      }
      if (this.bestMoveReason) {
        this.bestMoveReason.textContent = best.tacticalReason;
      }
    } else {
      if (this.bestMoveCol) this.bestMoveCol.textContent = 'Kein Zug';
      if (this.bestMoveTag) this.bestMoveTag.textContent = '—';
      if (this.bestMoveReason) this.bestMoveReason.textContent = 'Keine freien legalen Züge mehr verfügbar.';
    }

    // 4. Spalten-Liste im Tutor-Panel
    if (this.tutorColList) {
      this.tutorColList.innerHTML = '';
      analysis.moves.forEach((m, idx) => {
        const item = document.createElement('div');
        item.className = 'tutor-col-item' + (m.isBest ? ' is-best' : '');
        item.setAttribute('data-col', idx);

        let dotColor = '#94a3b8';
        if (m.type === 'WIN') dotColor = '#eab308';
        else if (m.type === 'MUST_BLOCK') dotColor = '#06b6d4';
        else if (m.type === 'PREEMPTIVE_BLOCK') dotColor = '#06b6d4';
        else if (m.type === 'FORK' || m.type === 'STRONG_ATTACK') dotColor = '#10b981';
        else if (m.type === 'BLUNDER' || m.type === 'FATAL_IGNORE') dotColor = '#ef4444';
        else if (m.type === 'ALLOWS_FORK') dotColor = '#ea580c';
        else if (m.type === 'CENTER') dotColor = '#3b82f6';
        else if (m.type === 'SOLID') dotColor = '#60a5fa';
        else if (m.type === 'RISKY') dotColor = '#f97316';
        else if (m.type === 'EDGE') dotColor = '#f59e0b';
        else if (m.isFull) dotColor = '#475569';

        item.innerHTML = `
          <div class="col-item-left">
            <span class="col-dot" style="background: ${dotColor};"></span>
            <span class="col-item-name">Spalte ${idx + 1}</span>
            <span class="col-rating-meter"><span class="col-rating-fill" style="width: ${m.ratingPercent}%; background: ${dotColor};"></span></span>
          </div>
          <div class="col-item-right">
            <span class="col-item-tag ${m.badgeClass}">${m.ratingGrade || m.badge}</span>
          </div>
        `;

        item.addEventListener('mouseenter', () => this.showMovePreview(idx));
        item.addEventListener('mouseleave', () => this.clearMovePreview());
        item.addEventListener('click', () => {
          if (!this.gameOver && !this.isAiTurn && !m.isFull) {
            this.handlePlayerAction('drop', idx);
          }
        });

        this.tutorColList.appendChild(item);
      });
    }

    // 5. Grundstrategie-Tipp (wechselnd basierend auf Spielstand)
    if (this.tutorStrategyTip) {
      const lessons = this.tutor.lessons;
      const lessonIdx = (this.stats.currentMoves + this.stats.rounds) % lessons.length;
      const currentLesson = lessons[lessonIdx];
      this.tutorStrategyTip.innerHTML = `<strong>${currentLesson.title}:</strong> ${currentLesson.proTip}`;
    }

    // 6. Quickbar Standardtext
    if (this.tutorQuickMsg) {
      if (best && !best.isFull) {
        this.tutorQuickMsg.innerHTML = `<strong>Tutor-Empfehlung:</strong> Spiele <strong>Spalte ${best.col + 1}</strong> [${best.ratingGrade}] — ${best.tacticalReason}`;
      } else {
        this.tutorQuickMsg.innerHTML = 'Wähle deinen nächsten Zug.';
      }
    }
  }

  /**
   * Zeigt die visuelle Veranschaulichung des Zugs auf dem Spielfeld (Ghost-Disc, Gefahren, Drohungen)
   * @param {number} col
   */
  showMovePreview(col) {
    if (!this.learnMode || !this.currentAnalysis || this.gameOver || this.isAiTurn) return;

    this.clearMovePreview();

    const move = this.currentAnalysis.moves[col];
    if (!move) return;

    if (move.isFull) {
      if (this.tutorQuickMsg) {
        this.tutorQuickMsg.innerHTML = `<strong>Spalte ${col + 1} ist voll!</strong> Wähle bitte eine freie Spalte.`;
      }
      return;
    }

    // Zielfeld hervorheben mit Ghost-Disc
    const targetRow = move.row;
    if (targetRow !== -1) {
      const slot = this.getSlotElement(targetRow, col);
      if (slot && !slot.querySelector('.ghost-disc')) {
        const ghost = document.createElement('div');
        ghost.className = `ghost-disc ghost-${move.type.toLowerCase()}`;
        const icon = move.badge.split(' ')[0] || '●';
        ghost.textContent = icon;
        slot.appendChild(ghost);
      }
    }

    // Gefahrenfeld hervorheben (Blunder, ungeblockte Drohung oder drohende Gegner-Gabel)
    if (move.highlights && move.highlights.dangerCell) {
      const [dr, dc] = move.highlights.dangerCell;
      const dangerSlot = this.getSlotElement(dr, dc);
      if (dangerSlot) {
        dangerSlot.classList.add('danger-field');
        if (move.type === 'FATAL_IGNORE') {
          dangerSlot.setAttribute('data-danger-label', `⚠️ GEGNER-SIEG IN SPALTE ${dc + 1}!`);
        } else if (move.type === 'ALLOWS_FORK') {
          dangerSlot.setAttribute('data-danger-label', `⚠️ DROHENDE GEGNER-GABEL IN SPALTE ${dc + 1}!`);
        } else {
          dangerSlot.setAttribute('data-danger-label', '⚠️ GEGNER-SIEG!');
        }
      }
    }

    // Gegnerische Drohungslinie hervorheben
    if (move.highlights && move.highlights.oppWinLine) {
      for (const [r, c] of move.highlights.oppWinLine) {
        const sl = this.getSlotElement(r, c);
        const disc = sl ? sl.querySelector('.disc') : null;
        if (disc) disc.classList.add('threat-highlight');
      }
    }

    // Eigene Gewinnlinie hervorheben
    if (move.highlights && move.highlights.winLine) {
      for (const [r, c] of move.highlights.winLine) {
        const sl = this.getSlotElement(r, c);
        const disc = sl ? sl.querySelector('.disc') : null;
        if (disc) disc.classList.add('win-highlight');
      }
    }

    // Quickbar anpassen mit Bewertung und detaillierter Erklärung
    if (this.tutorQuickMsg) {
      this.tutorQuickMsg.innerHTML = `<strong>Spalte ${col + 1} [${move.ratingGrade}]:</strong> ${move.headline} — ${move.explanation}`;
    }
  }

  /**
   * Entfernt alle visuellen Vorschau-Elemente vom Spielfeld
   */
  clearMovePreview() {
    // Alle Ghost-Discs entfernen
    const ghosts = this.boardGridEl.querySelectorAll('.ghost-disc');
    ghosts.forEach(g => g.remove());

    // Alle Danger-Fields entfernen
    const dangerSlots = this.boardGridEl.querySelectorAll('.danger-field');
    dangerSlots.forEach(s => {
      s.classList.remove('danger-field');
      s.removeAttribute('data-danger-label');
    });

    // Alle Threat/Win Highlights entfernen
    const highlightedDiscs = this.boardGridEl.querySelectorAll('.threat-highlight, .win-highlight');
    highlightedDiscs.forEach(d => d.classList.remove('threat-highlight', 'win-highlight'));

    // Quickbar auf Best-Move zurücksetzen
    if (this.learnMode && this.currentAnalysis && this.currentAnalysis.bestMove && this.tutorQuickMsg) {
      const best = this.currentAnalysis.bestMove;
      if (!best.isFull) {
        this.tutorQuickMsg.innerHTML = `<strong>Tutor-Empfehlung:</strong> Spiele <strong>Spalte ${best.col + 1}</strong> [${best.ratingGrade}] — ${best.tacticalReason}`;
      }
    }
  }

  /**
   * Leert alle Spalten-Badges
   */
  clearColBadges() {
    for (let c = 0; c < this.COLS; c++) {
      const badge = document.getElementById(`col-badge-${c}`);
      if (badge) {
        badge.className = 'col-badge';
        badge.textContent = '';
      }
    }
  }
}

// Initialisierung bei DOM-Bereitschaft
window.addEventListener('DOMContentLoaded', () => {
  window.game = new ConnectFourGame();
});
