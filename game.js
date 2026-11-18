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
    this.winner = null;
    this.isAiTurn = false;
    this.winningLine = null;
    this.history = [];      // Für Undo
    this.redoStack = [];    // Für Redo (Spielverlauf vorwärts anschauen)
    this.aiTimeoutId = null; // Timer-ID für anstehenden KI-Zug (abbrechbar bei Undo)
    this.isShowingBestMove = false; // Steuert die visuelle Anzeige des besten Zugs (ohne ihn zu spielen)

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
    this.initLanguage();
    this.bindEvents();
    this.renderBoard();
    this.updateUI();
    this.clearMovePreview();
    this.updateTutorUI();
  }

  t(key, params) {
    if (window.I18N) {
      return window.I18N.t(key, params);
    }
    return key;
  }

  initLanguage() {
    let saved = 'de';
    try {
      saved = localStorage.getItem('ag_4gewinnt_lang') || 'de';
    } catch (e) {}
    this.setLanguage(saved);
  }

  setLanguage(lang) {
    if (window.I18N) {
      window.I18N.setLanguage(lang);
    }
    if (this.tutor) {
      this.tutor.setLanguage(lang);
    }
    if (this.btnLangDe) this.btnLangDe.classList.toggle('active', lang === 'de');
    if (this.btnLangFr) this.btnLangFr.classList.toggle('active', lang === 'fr');

    if (this.learnModeStatus) {
      this.learnModeStatus.textContent = this.learnMode ? (lang === 'fr' ? 'OUI' : 'AN') : (lang === 'fr' ? 'NON' : 'AUS');
    }

    if (this.btnRibbonBestEl) {
      this.btnRibbonBestEl.innerHTML = this.isShowingBestMove ? `<span>✕ ${this.t('hideBestBtn')}</span>` : `<span>${this.t('ribbonBestBtn')}</span>`;
      this.btnRibbonBestEl.title = this.t('ribbonBestBtnTitle');
    }

    if (!this.isShowingBestMove && this.replayBestTargetEl) {
      this.replayBestTargetEl.textContent = this.t('bestColTarget', { col: 4 });
    }

    this.updateUI();
    this.updateTutorUI();
    if (this.isShowingBestMove) {
      this.displayBestMoveHint();
    }
  }

  getLang() {
    return (window.I18N && window.I18N.currentLang) || 'de';
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

    this.turnStoneRedTextEl = document.getElementById('turn-stone-red-text');
    this.turnStoneYellowTextEl = document.getElementById('turn-stone-yellow-text');
    this.btnManualAiEl = document.getElementById('btn-manual-ai');
    this.statP1WinsEl = document.getElementById('stat-p1-wins');
    this.statP2WinsEl = document.getElementById('stat-p2-wins');
    this.statP2LabelEl = document.getElementById('stat-p2-label');

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
    this.btnDismissBanner = document.getElementById('btn-dismiss-banner');
    this.btnUndoEl = document.getElementById('btn-undo');
    this.btnRedoEl = document.getElementById('btn-redo');
    this.boardFrameEl = document.querySelector('.board-frame');

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
    this.btnOpenOpenings = document.getElementById('btn-open-openings');
    this.btnOpenBlunders = document.getElementById('btn-open-blunders');
    this.btnCloseStrategyModal = document.getElementById('btn-close-strategy-modal');
    this.btnCloseStrategyFooter = document.getElementById('btn-close-strategy-footer');
    this.btnActivateLearn = document.getElementById('btn-activate-learn');

    // Zusatzregeln Ja/Nein Elemente
    this.btnBonusNo = document.getElementById('btn-bonus-no');
    this.btnBonusYes = document.getElementById('btn-bonus-yes');
    this.bonusRulesDrawer = document.getElementById('bonus-rules-drawer');

    // Farbanzeige unter dem Spielfeld (rotes und gelbes Steinchen)
    this.boardTurnBarEl = document.getElementById('board-turn-bar');
    this.turnBarCaptionEl = document.getElementById('turn-bar-caption');
    this.turnStoneRedEl = document.getElementById('turn-stone-red');
    this.turnStoneYellowEl = document.getElementById('turn-stone-yellow');

    // Replay- & Best-Move-Elemente
    this.replayPanelEl = document.getElementById('replay-panel');
    this.replayModeTagEl = document.getElementById('replay-mode-tag');
    this.replayStepCounterEl = document.getElementById('replay-step-counter');
    this.btnShowBestMoveEl = document.getElementById('btn-show-best-move');
    this.btnShowBestLabelEl = document.getElementById('btn-show-best-label');
    this.bestBtnIconEl = document.getElementById('best-btn-icon');
    this.replayBestCardEl = document.getElementById('replay-best-card');
    this.replayBestBadgeEl = document.getElementById('replay-best-badge');
    this.replayBestTargetEl = document.getElementById('replay-best-target');
    this.replayBestDescEl = document.getElementById('replay-best-desc');
    this.btnHideBestEl = document.getElementById('btn-hide-best');

    this.boardReplayRibbonEl = document.getElementById('board-replay-ribbon');
    this.ribbonStepCounterEl = document.getElementById('ribbon-step-counter');
    this.ribbonTurnDiscEl = document.getElementById('ribbon-turn-disc');
    this.ribbonTurnNameEl = document.getElementById('ribbon-turn-name');
    this.btnRibbonBestEl = document.getElementById('btn-ribbon-best');

    this.p1TurnPillEl = document.getElementById('p1-turn-pill');
    this.p2TurnPillEl = document.getElementById('p2-turn-pill');

    // Sprachumschaltung
    this.btnLangDe = document.getElementById('btn-lang-de');
    this.btnLangFr = document.getElementById('btn-lang-fr');
  }

  bindEvents() {
    // Sprachauswahl Buttons
    if (this.btnLangDe) {
      this.btnLangDe.addEventListener('click', () => this.setLanguage('de'));
    }
    if (this.btnLangFr) {
      this.btnLangFr.addEventListener('click', () => this.setLanguage('fr'));
    }

    // Spalten-Drop Buttons
    this.colSelectorsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.col-btn');
      if (btn) {
        const col = parseInt(btn.getAttribute('data-col'), 10);
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
      const btn = e.target.closest('.pop-btn');
      if (btn) {
        const col = parseInt(btn.getAttribute('data-col'), 10);
        this.handlePlayerAction('pop', col);
      }
    });

    // Manuelle KI-Auslösung bei Wiederholungen
    if (this.btnManualAiEl) {
      this.btnManualAiEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.triggerAiMove();
      });
    }

    // Spielmodus Umschalter
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.gameMode = btn.getAttribute('data-mode');
        
        const aiCard = document.getElementById('ai-settings-card');
        if (this.gameMode === 'pvc') {
          aiCard.style.display = 'block';
          if (this.p2NameEl) this.p2NameEl.textContent = this.t('colorYellowComputer');
          if (this.turnStoneYellowTextEl) this.turnStoneYellowTextEl.textContent = this.t('colorYellowComputer');
          if (this.turnStoneRedTextEl) this.turnStoneRedTextEl.textContent = this.t('colorRed');
          if (this.statP2LabelEl) this.statP2LabelEl.textContent = this.t('statP2WinsComputer');
        } else {
          aiCard.style.display = 'none';
          if (this.p2NameEl) this.p2NameEl.textContent = this.t('colorYellowP2');
          if (this.turnStoneYellowTextEl) this.turnStoneYellowTextEl.textContent = this.t('colorYellowP2');
          if (this.turnStoneRedTextEl) this.turnStoneRedTextEl.textContent = this.t('colorRedP1');
          if (this.statP2LabelEl) this.statP2LabelEl.textContent = this.t('statP2WinsP2');
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

    // Bonus Ja/Nein Umschalter
    if (this.btnBonusNo && this.btnBonusYes) {
      this.btnBonusNo.addEventListener('click', () => this.setBonusRulesActive(false));
      this.btnBonusYes.addEventListener('click', () => this.setBonusRulesActive(true));
    }

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
    
    const btnPlayAgain = document.getElementById('btn-play-again');
    if (btnPlayAgain) {
      btnPlayAgain.addEventListener('click', () => {
        this.restartGame();
      });
    }

    if (this.btnDismissBanner) {
      this.btnDismissBanner.addEventListener('click', () => {
        if (this.gameOverOverlayEl) {
          this.gameOverOverlayEl.style.display = 'none';
        }
      });
    }

    document.getElementById('btn-undo').addEventListener('click', () => this.undoLastMove());
    const btnRedo = document.getElementById('btn-redo');
    if (btnRedo) {
      btnRedo.addEventListener('click', () => this.redoNextMove());
    }

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

    // Tastenkürzel:
    // 'L' für Lernmodus
    // 'Ctrl+Z' oder 'U' für Zug zurück (Undo)
    // 'Ctrl+Y', 'Ctrl+Shift+Z' oder 'V' für Zug vorwärts (Redo)
    window.addEventListener('keydown', (e) => {
      if ((e.key === 'l' || e.key === 'L') && !e.target.matches('input, textarea')) {
        this.toggleLearnMode();
      }
      // Undo
      if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        this.undoLastMove();
      }
      if ((e.key === 'u' || e.key === 'U') && !e.target.matches('input, textarea') && !e.ctrlKey && !e.metaKey) {
        this.undoLastMove();
      }
      // Redo
      if ((e.key === 'y' || e.key === 'Y') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.redoNextMove();
      }
      if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        this.redoNextMove();
      }
      if ((e.key === 'v' || e.key === 'V') && !e.target.matches('input, textarea') && !e.ctrlKey && !e.metaKey) {
        this.redoNextMove();
      }
      // Bester Zug Toggle (Taste B oder H)
      if ((e.key === 'b' || e.key === 'B' || e.key === 'h' || e.key === 'H') && !e.target.matches('input, textarea') && !e.ctrlKey && !e.metaKey) {
        this.toggleBestMoveHint();
      }
    });

    // Bester Zug anzeigen Button (Links & im Ribbon)
    if (this.btnShowBestMoveEl) {
      this.btnShowBestMoveEl.addEventListener('click', () => this.toggleBestMoveHint());
    }
    if (this.btnRibbonBestEl) {
      this.btnRibbonBestEl.addEventListener('click', () => this.toggleBestMoveHint());
    }
    if (this.btnHideBestEl) {
      this.btnHideBestEl.addEventListener('click', () => this.clearBestMoveHint(true));
    }

    // Strategie Akademie Modal & Tab Navigation
    if (this.btnOpenStrategies) {
      this.btnOpenStrategies.addEventListener('click', () => this.openStrategyModal('strategies'));
    }
    if (this.btnOpenOpenings) {
      this.btnOpenOpenings.addEventListener('click', () => this.openStrategyModal('openings'));
    }
    if (this.btnOpenBlunders) {
      this.btnOpenBlunders.addEventListener('click', () => this.openStrategyModal('blunders'));
    }

    // Tab-Buttons im Modal
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchStrategyTab(tab);
      });
    });

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
    if (this.aiTimeoutId) {
      clearTimeout(this.aiTimeoutId);
      this.aiTimeoutId = null;
    }
    this.board = this.createEmptyBoard();
    this.currentPlayer = 1;
    this.gameOver = false;
    this.winner = null;
    this.isAiTurn = false;
    this.winningLine = null;
    this.history = [];
    this.redoStack = [];
    this.stats.currentMoves = 0;
    this.isShowingBestMove = false;
    this.clearBestMoveHint(true);

    // Game Over Banner ausblenden & Drop-Spalten wieder einblenden
    if (this.gameOverOverlayEl) {
      this.gameOverOverlayEl.style.display = 'none';
    }
    if (this.colSelectorsEl) {
      this.colSelectorsEl.style.display = 'grid';
    }
    if (this.boardFrameEl) {
      this.boardFrameEl.classList.remove('game-over-active');
    }

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

    // Aktive Vorschau des besten Zugs vor dem eigenen Spielzug entfernen
    if (this.isShowingBestMove) {
      this.clearBestMoveHint(true);
    }

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
    this.redoStack = []; // Neuer Spielzug verwirft vorangegangene Redo-Zweige

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
    this.redoStack = [];

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
    if (this.gameOver) return;

    if (this.aiTimeoutId) {
      clearTimeout(this.aiTimeoutId);
      this.aiTimeoutId = null;
    }

    this.isAiTurn = true;
    this.aiThinkingEl.style.display = 'flex';
    if (this.turnTextEl) this.turnTextEl.textContent = this.t('aiThinking');
    if (this.turnStoneYellowTextEl) this.turnStoneYellowTextEl.textContent = this.t('colorYellowThinking');
    if (this.turnBarCaptionEl) this.turnBarCaptionEl.textContent = this.t('turnBarCaptionAi');
    this.clearMovePreview();
    this.updateTutorUI();

    // Kleines Timeout, damit der Mensch den Zug animiert sieht und das UI nicht blockiert
    const delay = this.difficulty === 1 ? 250 : (this.difficulty === 2 ? 350 : 450);

    this.aiTimeoutId = setTimeout(() => {
      this.aiTimeoutId = null;
      if (this.gameOver || !this.isAiTurn) return;

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
    this.winner = winner;
    this.stats.rounds++;

    if (winner === 1) {
      this.stats.p1Wins++;
      this.winningLine = this.ai.findWinningLine(this.board);
      this.sound.playWin();
      this.showGameOverModal('🏆', this.t('winnerRedTitle'), this.t('winnerSubRed'), 'win-p1');
    } else if (winner === 2) {
      this.stats.p2Wins++;
      this.winningLine = this.ai.findWinningLine(this.board);
      this.sound.playWin();
      const title = this.gameMode === 'pvc' ? this.t('winnerAiTitle') : this.t('winnerYellowTitle');
      const sub = this.gameMode === 'pvc' ? this.t('winnerSubAi') : this.t('winnerSubYellow');
      this.showGameOverModal('🤖', title, sub, 'win-p2');
    } else {
      this.stats.draws++;
      this.sound.playDraw();
      this.showGameOverModal('🤝', this.t('winnerDrawTitle'), this.t('winnerSubDraw'), 'win-draw');
    }

    if (this.colSelectorsEl) {
      this.colSelectorsEl.style.display = 'none';
    }
    if (this.boardFrameEl) {
      this.boardFrameEl.classList.add('game-over-active');
    }

    this.renderBoard();
    this.updateUI();
    this.clearMovePreview();
    this.updateTutorUI();
  }

  showGameOverModal(icon, title, subtitle, winClass = '') {
    this.winnerIconEl.textContent = icon;
    this.winnerTitleEl.textContent = title;
    this.winnerSubEl.textContent = subtitle;
    this.gameOverOverlayEl.className = `gameover-banner ${winClass}`.trim();
    setTimeout(() => {
      this.gameOverOverlayEl.style.display = 'flex';
    }, 450);
  }

  openStrategyModal(tabName = 'openings') {
    if (!this.strategyModal) return;
    this.strategyModal.style.display = 'flex';
    this.switchStrategyTab(tabName);
  }

  switchStrategyTab(tabName) {
    const tabBtns = document.querySelectorAll('.modal-tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });
    tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === `tab-${tabName}`);
    });
  }

  saveHistoryState() {
    this.history.push({
      board: this.board.map(r => [...r]),
      currentPlayer: this.currentPlayer,
      moves: this.stats.currentMoves
    });
  }

  undoLastMove() {
    // Falls die KI gerade rechnet, brechen wir den anstehenden KI-Zug sofort ab
    if (this.aiTimeoutId) {
      clearTimeout(this.aiTimeoutId);
      this.aiTimeoutId = null;
    }
    this.isAiTurn = false;
    if (this.aiThinkingEl) {
      this.aiThinkingEl.style.display = 'none';
    }

    // Wenn keine Spielzüge mehr in der Historie sind, kann nichts zurückgenommen werden
    if (this.history.length === 0) return;

    const wasGameOver = this.gameOver;
    const prevWinner = this.winner;

    // Aktuellen Zustand vor dem Zurücknehmen auf den Redo-Stack sichern
    this.redoStack.push({
      board: this.board.map(r => [...r]),
      currentPlayer: this.currentPlayer,
      moves: this.stats.currentMoves,
      gameOver: wasGameOver,
      winner: prevWinner,
      winningLine: this.winningLine ? [...this.winningLine] : null
    });

    // Falls das Spiel beendet war: Status zurücksetzen und Rundenzähler anpassen
    if (wasGameOver) {
      if (this.stats.rounds > 0) this.stats.rounds--;
      if (prevWinner === 1 && this.stats.p1Wins > 0) {
        this.stats.p1Wins--;
      } else if (prevWinner === 2 && this.stats.p2Wins > 0) {
        this.stats.p2Wins--;
      } else if (prevWinner === 0 && this.stats.draws > 0) {
        this.stats.draws--;
      }

      this.gameOver = false;
      this.winner = null;
      this.winningLine = null;

      if (this.gameOverOverlayEl) {
        this.gameOverOverlayEl.style.display = 'none';
      }
      if (this.colSelectorsEl) {
        this.colSelectorsEl.style.display = 'grid';
      }
      if (this.boardFrameEl) {
        this.boardFrameEl.classList.remove('game-over-active');
      }
    }

    // WICHTIG: IMMER genau 1 Spielstein pro Klick zurücknehmen (Stein für Stein)
    // Man kann dadurch das gesamte Spiel bis zum allerersten Zug zurückgehen!
    const lastState = this.history.pop();
    this.board = lastState.board;
    this.currentPlayer = lastState.currentPlayer;
    this.stats.currentMoves = lastState.moves;

    this.sound.playPop();
    this.renderBoard();
    this.updateUI();
    this.clearMovePreview();
    this.updateTutorUI();

    // Falls Bester Zug aktiv ist, sofort für die vorherige Stellung neu berechnen und anzeigen
    if (this.isShowingBestMove) {
      this.displayBestMoveHint();
    }

    // Feedback im Tutor-Quickbar
    if (this.learnMode && this.tutorQuickMsg) {
      const isFr = this.getLang() === 'fr';
      const playerLabel = this.currentPlayer === 1 ? this.t('colorRedP1') : (this.gameMode === 'pvc' ? this.t('colorYellowComputer') : this.t('colorYellowP2'));
      if (isFr) {
        this.tutorQuickMsg.innerHTML = wasGameOver 
          ? `<strong>Position gagnante annulée !</strong> 1 coup en arrière. ${playerLabel} doit jouer. (Historique : ${this.history.length} arrière / ${this.redoStack.length} avant)` 
          : `<strong>1 coup en arrière.</strong> ${playerLabel} doit jouer. (Historique : ${this.history.length} arrière / ${this.redoStack.length} avant)`;
      } else {
        this.tutorQuickMsg.innerHTML = wasGameOver 
          ? `<strong>Gewinnstellung aufgehoben!</strong> 1 Stein zurückgenommen. ${playerLabel} ist als Nächstes am Zug. (Verlauf: ${this.history.length} zurück / ${this.redoStack.length} vor)` 
          : `<strong>1 Stein zurückgenommen.</strong> ${playerLabel} ist als Nächstes am Zug. (Verlauf: ${this.history.length} zurück / ${this.redoStack.length} vor)`;
      }
    }
  }

  redoNextMove() {
    // Falls die KI rechnet, abbrechen
    if (this.aiTimeoutId) {
      clearTimeout(this.aiTimeoutId);
      this.aiTimeoutId = null;
    }
    this.isAiTurn = false;
    if (this.aiThinkingEl) {
      this.aiThinkingEl.style.display = 'none';
    }

    if (this.redoStack.length === 0) return;

    // Aktuellen Zustand vor dem Vorwärtsgehen auf History sichern
    this.history.push({
      board: this.board.map(r => [...r]),
      currentPlayer: this.currentPlayer,
      moves: this.stats.currentMoves
    });

    const nextState = this.redoStack.pop();
    this.board = nextState.board;
    this.currentPlayer = nextState.currentPlayer;
    this.stats.currentMoves = nextState.moves;

    // Falls dieser Zug die Partie beendet hatte, Zustand und Stats wiederherstellen
    if (nextState.gameOver) {
      this.gameOver = true;
      this.winner = nextState.winner;
      this.winningLine = nextState.winningLine;
      this.stats.rounds++;
      if (this.winner === 1) this.stats.p1Wins++;
      else if (this.winner === 2) this.stats.p2Wins++;
      else if (this.winner === 0) this.stats.draws++;

      if (this.colSelectorsEl) this.colSelectorsEl.style.display = 'none';
      if (this.boardFrameEl) this.boardFrameEl.classList.add('game-over-active');

      const title = this.winner === 1 ? this.t('winnerRedTitle') : (this.winner === 2 ? (this.gameMode === 'pvc' ? this.t('winnerAiTitle') : this.t('winnerYellowTitle')) : this.t('winnerDrawTitle'));
      const sub = this.winner === 1 ? this.t('winnerSubRed') : (this.winner === 2 ? (this.gameMode === 'pvc' ? this.t('winnerSubAi') : this.t('winnerSubYellow')) : this.t('winnerSubDraw'));
      const winClass = this.winner === 1 ? 'win-p1' : (this.winner === 2 ? 'win-p2' : 'win-draw');
      const icon = this.winner === 1 ? '🏆' : (this.winner === 2 ? '🤖' : '🤝');
      this.showGameOverModal(icon, title, sub, winClass);

      if (this.isShowingBestMove) {
        this.clearBestMoveHint(true);
      }
    } else {
      this.gameOver = false;
      this.winner = null;
      this.winningLine = null;
      if (this.gameOverOverlayEl) this.gameOverOverlayEl.style.display = 'none';
      if (this.colSelectorsEl) this.colSelectorsEl.style.display = 'grid';
      if (this.boardFrameEl) this.boardFrameEl.classList.remove('game-over-active');
    }

    this.sound.playDrop(2);
    this.renderBoard();
    this.updateUI();
    this.clearMovePreview();
    this.updateTutorUI();

    // Falls Bester Zug aktiv ist, sofort für die Folgestellung neu berechnen und anzeigen
    if (this.isShowingBestMove && !this.gameOver) {
      this.displayBestMoveHint();
    }

    // Feedback im Tutor-Quickbar
    if (this.learnMode && this.tutorQuickMsg) {
      const isFr = this.getLang() === 'fr';
      const playerLabel = this.currentPlayer === 1 ? this.t('colorRedP1') : (this.gameMode === 'pvc' ? this.t('colorYellowComputer') : this.t('colorYellowP2'));
      if (isFr) {
        this.tutorQuickMsg.innerHTML = nextState.gameOver
          ? `<strong>Avance jusqu'à la fin de la partie !</strong> Position gagnante rétablie. (Historique : ${this.history.length} arrière / ${this.redoStack.length} avant)`
          : `<strong>1 coup en avant.</strong> ${playerLabel} doit jouer. (Historique : ${this.history.length} arrière / ${this.redoStack.length} avant)`;
      } else {
        this.tutorQuickMsg.innerHTML = nextState.gameOver
          ? `<strong>Vorwärts zum Spielende!</strong> Siegesstellung wiederhergestellt. (Verlauf: ${this.history.length} zurück / ${this.redoStack.length} vor)`
          : `<strong>1 Stein vorwärts.</strong> ${playerLabel} ist als Nächstes am Zug. (Verlauf: ${this.history.length} zurück / ${this.redoStack.length} vor)`;
      }
    }
  }

  updateUI() {
    // Falls das obere HUD vorhanden ist (optional)
    if (this.gameOver) {
      if (this.winner === 1) {
        if (this.p1HudEl) this.p1HudEl.classList.add('active', 'winner-glow');
        if (this.p2HudEl) this.p2HudEl.classList.remove('active', 'winner-glow');
        if (this.turnTextEl) this.turnTextEl.textContent = `🏆 ${this.t('winnerRedTitle')}`;
      } else if (this.winner === 2) {
        if (this.p2HudEl) this.p2HudEl.classList.add('active', 'winner-glow');
        if (this.p1HudEl) this.p1HudEl.classList.remove('active', 'winner-glow');
        const p2WinTitle = this.gameMode === 'pvc' ? this.t('winnerAiTitle') : this.t('winnerYellowTitle');
        if (this.turnTextEl) this.turnTextEl.textContent = `🤖 ${p2WinTitle}`;
      } else {
        if (this.p1HudEl) this.p1HudEl.classList.remove('active', 'winner-glow');
        if (this.p2HudEl) this.p2HudEl.classList.remove('active', 'winner-glow');
        if (this.turnTextEl) this.turnTextEl.textContent = `🤝 ${this.t('winnerDrawTitle')}`;
      }
    } else {
      if (this.p1HudEl) this.p1HudEl.classList.remove('winner-glow');
      if (this.p2HudEl) this.p2HudEl.classList.remove('winner-glow');
      const isReplaying = this.redoStack.length > 0;
      const isFr = this.getLang() === 'fr';
      const replayTag = isFr ? 'Relecture' : 'Wiederholung';
      if (this.currentPlayer === 1) {
        if (this.p1HudEl) {
          this.p1HudEl.classList.add('active');
          this.p2HudEl.classList.remove('active');
        }
        if (this.turnTextEl) {
          const redTurnText = isFr ? 'Au tour des Rouges' : 'Rot ist am Zug';
          this.turnTextEl.innerHTML = isReplaying 
            ? `<span class="turn-replay-chip">${replayTag}</span> <span>🔴 ${redTurnText}</span>` 
            : redTurnText;
        }
      } else {
        if (this.p1HudEl) this.p1HudEl.classList.remove('active');
        if (this.p2HudEl) this.p2HudEl.classList.add('active');
        if (this.turnTextEl) {
          if (this.gameMode === 'pvc') {
            const replayPrefix = isReplaying ? `<span class="turn-replay-chip">${replayTag}</span> ` : '';
            const yellowTurnText = isFr ? "L'IA réfléchit..." : 'Gelb (KI) ist am Zug';
            this.turnTextEl.innerHTML = `${replayPrefix}<span>🟡 ${yellowTurnText}</span>`;
          } else {
            const yellowTurnText = isFr ? 'Au tour des Jaunes' : 'Gelb ist am Zug';
            this.turnTextEl.innerHTML = isReplaying 
              ? `<span class="turn-replay-chip">${replayTag}</span> <span>🟡 ${yellowTurnText}</span>` 
              : yellowTurnText;
          }
        }
      }
    }

    const winSuffix = this.getLang() === 'fr' ? 'victoires' : 'Siege';
    if (this.p1ScoreEl) this.p1ScoreEl.textContent = `${this.stats.p1Wins} ${winSuffix}`;
    if (this.p2ScoreEl) this.p2ScoreEl.textContent = `${this.stats.p2Wins} ${winSuffix}`;
    if (this.statP1WinsEl) this.statP1WinsEl.textContent = this.stats.p1Wins;
    if (this.statP2WinsEl) this.statP2WinsEl.textContent = this.stats.p2Wins;
    if (this.statP2LabelEl) {
      this.statP2LabelEl.textContent = this.gameMode === 'pvc' ? this.t('statP2WinsComputer') : this.t('statP2WinsP2');
    }

    // Statistiken
    this.statRoundsEl.textContent = this.stats.rounds;
    this.statDrawsEl.textContent = this.stats.draws;
    this.statMovesEl.textContent = this.stats.currentMoves;

    this.updateAlgoDepthDisplay();
    this.updateColButtons();
    this.updatePopOutButtons();

    // Undo / Redo Buttons aktualisieren
    const canUndo = this.history.length > 0;
    if (this.btnUndoEl) {
      this.btnUndoEl.disabled = !canUndo;
      this.btnUndoEl.title = canUndo 
        ? `${this.t('undoTooltip')} (${this.history.length})` 
        : '';
    }

    const canRedo = this.redoStack.length > 0;
    if (this.btnRedoEl) {
      this.btnRedoEl.disabled = !canRedo;
      this.btnRedoEl.title = canRedo 
        ? `${this.t('redoTooltip')} (${this.redoStack.length})` 
        : '';
    }

    // Kenntliche Farbanzeige & Wiederholungs-Status aktualisieren
    this.updateReplayAndTurnDisplay();
  }

  updateAlgoDepthDisplay() {
    const suffix = this.t('algoMovesSuffix');
    const depths = {
      1: `1 ${suffix} (${this.t('diff1Name')})`,
      2: `3 ${suffix} (${this.t('diff2Name')})`,
      3: `5 ${suffix} (${this.t('diff3Name')})`,
      4: `7+ ${suffix} (${this.t('diff4Name')})`
    };
    this.algoDepthEl.textContent = depths[this.difficulty] || `3 ${suffix}`;
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
      // Nur aktiv, wenn der unterste Stein dem aktuellen Spieler gehört und Spiel läuft
      const canPop = (bottomCell === this.currentPlayer) && !this.gameOver;
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

    const isFr = window.I18N && window.I18N.currentLang === 'fr';
    if (this.learnMode) {
      if (this.btnLearnMode) this.btnLearnMode.classList.add('active');
      if (this.learnModeStatus) this.learnModeStatus.textContent = isFr ? 'OUI' : 'AN';
      document.body.classList.add('learn-mode-on');
      if (this.tutorQuickbar) this.tutorQuickbar.style.display = 'flex';
      if (this.tutorCard) this.tutorCard.style.display = 'block';
      if (this.tutorTeaserCard) this.tutorTeaserCard.style.display = 'none';
      this.updateTutorUI();
    } else {
      if (this.btnLearnMode) this.btnLearnMode.classList.remove('active');
      if (this.learnModeStatus) this.learnModeStatus.textContent = isFr ? 'NON' : 'AUS';
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
      if (this.coachMoodTitle) this.coachMoodTitle.textContent = this.t('winnerTag');
      if (this.winner === 1) {
        if (this.coachText) this.coachText.textContent = this.t('coachGameOverRed');
        if (this.tutorQuickMsg) this.tutorQuickMsg.innerHTML = `<strong>${this.t('tutorQuickWinRedTitle')}</strong> ${this.t('tutorQuickWinRedDesc')}`;
      } else if (this.winner === 2) {
        const isFr = this.getLang() === 'fr';
        const kiName = this.gameMode === 'pvc' ? (isFr ? "L'IA" : 'Die KI') : this.t('colorYellow');
        if (this.coachText) this.coachText.textContent = this.t('coachGameOverYellow', { name: kiName });
        if (this.tutorQuickMsg) this.tutorQuickMsg.innerHTML = `<strong>${this.t('tutorQuickWinYellowTitle', { name: kiName })}</strong> ${this.t('tutorQuickWinYellowDesc')}`;
      } else {
        if (this.coachText) this.coachText.textContent = this.t('coachGameOverDraw');
        if (this.tutorQuickMsg) this.tutorQuickMsg.innerHTML = `<strong>${this.t('winnerDrawTitle')}</strong> ${this.t('coachGameOverDraw')}`;
      }
      this.clearColBadges();
      return;
    }

    if (this.isAiTurn) {
      const isFr = this.getLang() === 'fr';
      const kiTitle = isFr ? "L'IA est en train de jouer..." : 'Die KI ist am Zug...';
      if (this.coachMoodIcon) this.coachMoodIcon.textContent = '⏳';
      if (this.coachMoodTitle) this.coachMoodTitle.textContent = this.t('coachThinkingTitle');
      if (this.coachText) this.coachText.textContent = this.t('coachThinkingText');
      if (this.tutorQuickMsg) this.tutorQuickMsg.innerHTML = `<strong>${kiTitle}</strong> ${this.t('tutorQuickAiThinking')}`;
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
      if (this.bestMoveCol) this.bestMoveCol.textContent = this.t('bestColTarget', { col: best.col + 1 });
      if (this.bestMoveTag) {
        this.bestMoveTag.textContent = best.badge;
        this.bestMoveTag.className = `best-move-tag ${best.badgeClass}`;
      }
      if (this.bestMoveReason) {
        this.bestMoveReason.textContent = best.tacticalReason;
      }
    } else {
      if (this.bestMoveCol) this.bestMoveCol.textContent = this.t('noMovePossible');
      if (this.bestMoveTag) this.bestMoveTag.textContent = '—';
      if (this.bestMoveReason) this.bestMoveReason.textContent = this.t('noMoveDesc');
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
            <span class="col-item-name">${this.t('bestColTarget', { col: idx + 1 })}</span>
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
      const currentLesson = this.tutor.getLesson(lessonIdx, this.getLang());
      this.tutorStrategyTip.innerHTML = `<strong>${currentLesson.title}:</strong> ${currentLesson.proTip}`;
    }

    // 6. Quickbar Standardtext
    if (this.tutorQuickMsg) {
      if (best && !best.isFull) {
        const colLabel = this.t('bestColTarget', { col: best.col + 1 });
        const playColStr = this.t('tutorPlayCol', { col: colLabel });
        this.tutorQuickMsg.innerHTML = `<strong>${this.t('tutorRecommendation')}:</strong> ${playColStr} [${best.ratingGrade || best.badge}] — ${best.tacticalReason}`;
      } else {
        this.tutorQuickMsg.innerHTML = this.t('tutorQuickWelcome');
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
        const colLabel = this.t('bestColTarget', { col: col + 1 });
        this.tutorQuickMsg.innerHTML = `<strong>${this.t('colFullMsg', { col: colLabel })}</strong> ${this.t('chooseFreeCol')}`;
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
        const dangerColName = this.t('bestColTarget', { col: dc + 1 }).toUpperCase();
        if (move.type === 'FATAL_IGNORE') {
          dangerSlot.setAttribute('data-danger-label', `⚠️ ${this.t('dangerOppWinIn', { col: dangerColName })}!`);
        } else if (move.type === 'ALLOWS_FORK') {
          dangerSlot.setAttribute('data-danger-label', `⚠️ ${this.t('dangerOppForkIn', { col: dangerColName })}!`);
        } else {
          dangerSlot.setAttribute('data-danger-label', `⚠️ ${this.t('dangerOppWin')}!`);
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
      const colLabel = this.t('bestColTarget', { col: col + 1 });
      this.tutorQuickMsg.innerHTML = `<strong>${colLabel} [${move.ratingGrade}]:</strong> ${move.headline} — ${move.explanation}`;
    }
  }

  /**
   * Entfernt alle visuellen Vorschau-Elemente vom Spielfeld
   */
  clearMovePreview() {
    // Alle normalen Ghost-Discs entfernen (außer Best-Move Hint, falls gerade aktiv)
    const ghosts = this.boardGridEl.querySelectorAll('.ghost-disc:not(.ghost-best-hint)');
    ghosts.forEach(g => g.remove());

    // Alle Danger-Fields entfernen
    const dangerSlots = this.boardGridEl.querySelectorAll('.danger-field');
    dangerSlots.forEach(s => {
      s.classList.remove('danger-field');
      s.removeAttribute('data-danger-label');
    });

    // Alle Threat/Win Highlights entfernen (außer bei aktivem Best-Move Hint)
    if (!this.isShowingBestMove) {
      const highlightedDiscs = this.boardGridEl.querySelectorAll('.threat-highlight, .win-highlight');
      highlightedDiscs.forEach(d => d.classList.remove('threat-highlight', 'win-highlight'));
    }

    // Quickbar auf Best-Move zurücksetzen
    if (this.learnMode && this.currentAnalysis && this.currentAnalysis.bestMove && this.tutorQuickMsg) {
      const best = this.currentAnalysis.bestMove;
      if (!best.isFull) {
        const colLabel = this.t('bestColTarget', { col: best.col + 1 });
        const playColStr = this.t('tutorPlayCol', { col: colLabel });
        this.tutorQuickMsg.innerHTML = `<strong>${this.t('tutorRecommendation')}:</strong> ${playColStr} [${best.ratingGrade || best.badge}] — ${best.tacticalReason}`;
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

  /**
   * Steuert die Anzeige des Zusatzregeln-Blocks (Ja / Nein)
   * @param {boolean} active
   */
  setBonusRulesActive(active) {
    if (active) {
      if (this.btnBonusYes) this.btnBonusYes.classList.add('active');
      if (this.btnBonusNo) this.btnBonusNo.classList.remove('active');
      if (this.bonusRulesDrawer) this.bonusRulesDrawer.style.display = 'block';
    } else {
      if (this.btnBonusNo) this.btnBonusNo.classList.add('active');
      if (this.btnBonusYes) this.btnBonusYes.classList.remove('active');
      if (this.bonusRulesDrawer) this.bonusRulesDrawer.style.display = 'none';

      let needRestart = false;
      if (this.togglePopoutEl && this.togglePopoutEl.checked) {
        this.togglePopoutEl.checked = false;
        this.popOutEnabled = false;
        if (this.popoutBarEl) this.popoutBarEl.style.display = 'none';
      }
      if (this.toggleObstaclesEl && this.toggleObstaclesEl.checked) {
        this.toggleObstaclesEl.checked = false;
        this.obstaclesEnabled = false;
        needRestart = true;
      }
      if (needRestart) {
        this.restartGame();
      } else {
        this.updatePopOutButtons();
        this.updateTutorUI();
      }
    }
  }

  /**
   * Aktualisiert die visuelle Kenntlichmachung, welche Farbe als Nächstes am Zug ist:
   * platzsparend direkt unter dem Spielfeld (rotes und gelbes Steinchen),
   * im Ribbon über dem Spielfeld und im HUD.
   */
  updateReplayAndTurnDisplay() {
    const isReplaying = this.redoStack.length > 0;
    const totalMoves = this.history.length + this.redoStack.length;
    const currentStep = this.history.length;

    const isP1 = this.currentPlayer === 1;
    const isComputer = this.gameMode === 'pvc';
    const pColorName = isP1 ? this.t('colorRed') : (isComputer ? this.t('colorYellowComputer') : this.t('colorYellowP2'));
    const pColorClass = isP1 ? 'turn-red' : 'turn-yellow';
    const pDiscClass = isP1 ? 'disc-red' : 'disc-yellow';

    // 1. Platzsparende Farbanzeige direkt unter dem Spielfeld mit rotem & gelbem Steinchen
    const yellowLabel = isComputer 
      ? (this.isAiTurn ? this.t('colorYellowThinking') : this.t('colorYellowComputer')) 
      : this.t('colorYellowP2');
    const redLabel = isComputer ? this.t('colorRed') : this.t('colorRedP1');

    if (this.turnStoneRedTextEl) this.turnStoneRedTextEl.textContent = redLabel;
    if (this.turnStoneYellowTextEl) this.turnStoneYellowTextEl.textContent = yellowLabel;

    if (this.turnStoneRedEl && this.turnStoneYellowEl) {
      if (this.gameOver) {
        if (this.winner === 1) {
          this.turnStoneRedEl.classList.add('active', 'is-winner');
          this.turnStoneYellowEl.classList.remove('active', 'is-winner');
          if (this.turnBarCaptionEl) this.turnBarCaptionEl.textContent = this.t('turnBarCaptionWinner');
        } else if (this.winner === 2) {
          this.turnStoneYellowEl.classList.add('active', 'is-winner');
          this.turnStoneRedEl.classList.remove('active', 'is-winner');
          if (this.turnBarCaptionEl) this.turnBarCaptionEl.textContent = isComputer ? this.t('turnBarCaptionAiWinner') : this.t('turnBarCaptionWinner');
        } else {
          this.turnStoneRedEl.classList.remove('active', 'is-winner');
          this.turnStoneYellowEl.classList.remove('active', 'is-winner');
          if (this.turnBarCaptionEl) this.turnBarCaptionEl.textContent = this.t('turnBarCaptionDraw');
        }
      } else {
        this.turnStoneRedEl.classList.remove('is-winner');
        this.turnStoneYellowEl.classList.remove('is-winner');
        this.turnStoneRedEl.classList.toggle('active', isP1);
        this.turnStoneYellowEl.classList.toggle('active', !isP1);
        this.turnStoneRedEl.title = isP1 ? `${redLabel} (${this.t('turnBarCaption')})` : redLabel;
        this.turnStoneYellowEl.title = !isP1 ? `${yellowLabel} (${this.t('turnBarCaption')})` : yellowLabel;

        if (this.turnBarCaptionEl) {
          if (isReplaying) {
            this.turnBarCaptionEl.textContent = this.t('turnBarCaptionReplay');
          } else if (this.isAiTurn) {
            this.turnBarCaptionEl.textContent = this.t('turnBarCaptionAi');
          } else {
            this.turnBarCaptionEl.textContent = this.t('turnBarCaption');
          }
        }
      }
    }

    // Manueller KI-Button bei Wiederholungen (wenn Gelb/Computer dran ist)
    if (this.btnManualAiEl) {
      const showManualAi = isReplaying && !this.gameOver && !isP1 && isComputer;
      this.btnManualAiEl.style.display = showManualAi ? 'inline-flex' : 'none';
    }

    // 2. Replay-Zähler in der linken Aktions-Karte
    if (this.replayStepCounterEl) {
      this.replayStepCounterEl.textContent = isReplaying 
        ? this.t('replayMoveOf', { n: currentStep, total: totalMoves }) 
        : this.t('replayMove', { n: currentStep });
    }
    if (this.replayModeTagEl) {
      this.replayModeTagEl.textContent = isReplaying ? this.t('replayModeReplay') : this.t('replayModeLive');
      this.replayModeTagEl.className = `replay-mode-tag ${isReplaying ? 'is-replay' : 'is-live'}`;
    }

    // 3. Ribbon direkt über dem Spielfeld (wird bei Wiederholungen eingeblendet)
    if (this.boardReplayRibbonEl) {
      if (isReplaying && !this.gameOver) {
        this.boardReplayRibbonEl.style.display = 'flex';
        this.boardReplayRibbonEl.className = `board-replay-ribbon ${pColorClass}`;
        if (this.ribbonStepCounterEl) {
          this.ribbonStepCounterEl.textContent = this.t('ribbonStepOf', { current: currentStep, total: totalMoves });
        }
        if (this.ribbonTurnDiscEl) {
          this.ribbonTurnDiscEl.className = `ribbon-disc ${pDiscClass}`;
        }
        if (this.ribbonTurnNameEl) {
          this.ribbonTurnNameEl.textContent = isP1 ? this.t('ribbonRedTurn') : this.t('ribbonYellowTurn');
        }
      } else {
        this.boardReplayRibbonEl.style.display = 'none';
      }
    }

    // 4. HUD Turn Pills (aktiver Spieler hat einen blinkenden "NÄCHSTER ZUG" Chip)
    if (this.p1TurnPillEl) {
      this.p1TurnPillEl.style.display = (!this.gameOver && isP1) ? 'inline-flex' : 'none';
    }
    if (this.p2TurnPillEl) {
      this.p2TurnPillEl.style.display = (!this.gameOver && !isP1) ? 'inline-flex' : 'none';
    }

    // 5. Spielfeld-Rahmen Randbeleuchtung
    if (this.boardFrameEl) {
      this.boardFrameEl.classList.toggle('turn-red-active', !this.gameOver && isP1);
      this.boardFrameEl.classList.toggle('turn-yellow-active', !this.gameOver && !isP1);
      this.boardFrameEl.classList.toggle('replay-mode-active', isReplaying && !this.gameOver);
    }

    // 6. Spalten-Wahlschalter Pfeilfarben
    if (this.colSelectorsEl) {
      this.colSelectorsEl.classList.toggle('next-p1', isP1);
      this.colSelectorsEl.classList.toggle('next-p2', !isP1);
    }

    // 7. Zustand des "Bester Zug anzeigen" Buttons
    if (this.btnShowBestMoveEl) {
      if (this.gameOver) {
        this.btnShowBestMoveEl.disabled = true;
      } else {
        this.btnShowBestMoveEl.disabled = false;
        this.btnShowBestMoveEl.title = this.t('bestBtnTitle', { player: pColorName });
      }
    }
    if (this.btnRibbonBestEl) {
      this.btnRibbonBestEl.disabled = this.gameOver;
    }
  }

  /**
   * Schaltet die visuelle Anzeige des besten Zugs ein oder aus (nur anzeigen, nicht spielen!)
   */
  toggleBestMoveHint() {
    if (this.gameOver) return;
    if (this.isShowingBestMove) {
      this.clearBestMoveHint(true);
    } else {
      this.displayBestMoveHint();
    }
  }

  /**
   * Berechnet und zeigt den besten Zug für die aktuelle Stellung optisch auf dem Brett an.
   * Führt den Zug NICHT aus ("Also nur zeigen nicht spielen").
   */
  displayBestMoveHint() {
    if (this.gameOver) return;

    // Vorherige Markierungen bereinigen (Flag bleibt vorerst aktiv)
    this.clearBestMoveHint(false);

    // Taktische Analyse für den aktuell am Zug befindlichen Spieler ausführen
    const analysis = this.tutor.analyzeBoard(this.board, this.currentPlayer, this.popOutEnabled);
    const best = analysis.bestMove;

    if (!best || best.isFull) {
      if (this.replayBestCardEl) {
        this.replayBestCardEl.style.display = 'block';
        if (this.replayBestTargetEl) this.replayBestTargetEl.textContent = this.t('noMovePossible');
        if (this.replayBestDescEl) this.replayBestDescEl.textContent = this.t('noMoveDesc');
      }
      return;
    }

    this.isShowingBestMove = true;

    // Buttons auf "Ausblenden" umschalten
    if (this.btnShowBestLabelEl) this.btnShowBestLabelEl.textContent = this.t('hideBestBtn');
    if (this.bestBtnIconEl) this.bestBtnIconEl.textContent = '✕';
    if (this.btnShowBestMoveEl) this.btnShowBestMoveEl.classList.add('active-showing');
    if (this.btnRibbonBestEl) {
      this.btnRibbonBestEl.classList.add('active-showing');
      this.btnRibbonBestEl.innerHTML = `<span>✕ ${this.t('hideBestBtn')}</span>`;
    }

    const isP1 = this.currentPlayer === 1;
    const isComputer = this.gameMode === 'pvc';
    const pColorName = isP1 ? this.t('colorRed') : (isComputer ? this.t('colorYellowComputer') : this.t('colorYellowP2'));
    const colName = this.t('bestColTarget', { col: best.col + 1 });

    // Replay Best-Move Infokarte im linken Panel befüllen
    if (this.replayBestCardEl) {
      this.replayBestCardEl.style.display = 'block';
      if (this.replayBestBadgeEl) {
        this.replayBestBadgeEl.textContent = `${best.badge} — ${best.qualityLabel || this.t('topRecommendationBadge')}`;
        this.replayBestBadgeEl.className = `best-tag ${best.badgeClass || 'badge-best'}`;
      }
      if (this.replayBestTargetEl) {
        const actionLabel = best.action === 'pop' ? '▲ Pop-Out' : this.t('actionDrop');
        const inWord = this.t('prepositionIn');
        this.replayBestTargetEl.innerHTML = `${actionLabel} ${inWord} <strong>${colName}</strong> <small>(${pColorName})</small>`;
      }
      if (this.replayBestDescEl) {
        const descText = best.explanation || best.tacticalReason || best.headline || '';
        this.replayBestDescEl.textContent = `${best.headline ? best.headline + ' — ' : ''}${descText}`;
      }
    }

    // Visuell auf dem Brett hervorheben (nur zeigen, niemals spielen!)
    if (best.action === 'drop' && best.row !== -1) {
      const slot = this.getSlotElement(best.row, best.col);
      if (slot) {
        slot.classList.add('best-hint-slot', isP1 ? 'hint-p1' : 'hint-p2');

        const ghost = document.createElement('div');
        ghost.className = `ghost-disc ghost-best-hint ${isP1 ? 'ghost-p1' : 'ghost-p2'}`;

        let icon = '💡';
        if (best.type === 'WIN') icon = '👑';
        else if (best.type === 'MUST_BLOCK') icon = '🛡️';
        else if (best.type === 'PREEMPTIVE_BLOCK') icon = '🛡️⚡';
        else if (best.type === 'FORK') icon = '⚡';
        else if (best.type === 'CENTER') icon = '⭐';

        ghost.innerHTML = `
          <div class="ghost-hint-inner">
            <span class="ghost-hint-symbol">${icon}</span>
            <span class="ghost-hint-tag">${this.t('bestHintTag')}</span>
          </div>
        `;
        slot.appendChild(ghost);
      }

      // Drop-Button über der Spalte hervorheben
      const colBtn = this.colSelectorsEl.querySelector(`.col-btn[data-col="${best.col}"]`);
      if (colBtn) {
        colBtn.classList.add('best-col-hint', isP1 ? 'hint-p1' : 'hint-p2');
      }

      const colBadge = document.getElementById(`col-badge-${best.col}`);
      if (colBadge) {
        colBadge.textContent = this.t('bestColBadge');
        colBadge.className = 'col-badge badge-best-hint';
      }
    } else if (best.action === 'pop') {
      // Pop-Out Button hervorheben
      const popBtn = this.popoutButtonsEl.querySelector(`.pop-btn[data-col="${best.col}"]`);
      if (popBtn) {
        popBtn.classList.add('best-pop-hint', isP1 ? 'hint-p1' : 'hint-p2');
      }
      const bottomSlot = this.getSlotElement(this.ROWS - 1, best.col);
      const disc = bottomSlot ? bottomSlot.querySelector('.disc') : null;
      if (disc) {
        disc.classList.add('best-pop-disc-hint');
      }
    }

    // Taktische Linien-Hervorhebungen
    if (best.highlights) {
      if (best.highlights.winLine) {
        for (const [r, c] of best.highlights.winLine) {
          const sl = this.getSlotElement(r, c);
          const disc = sl ? sl.querySelector('.disc') : null;
          if (disc) disc.classList.add('win-highlight');
        }
      }
      if (best.highlights.oppWinLine) {
        for (const [r, c] of best.highlights.oppWinLine) {
          const sl = this.getSlotElement(r, c);
          const disc = sl ? sl.querySelector('.disc') : null;
          if (disc) disc.classList.add('threat-highlight');
        }
      }
    }

    // Feedback in Quickbar
    if (this.tutorQuickMsg) {
      const bestMoveLabel = this.t('bestMoveFor', { player: pColorName });
      this.tutorQuickMsg.innerHTML = `<strong>💡 ${bestMoveLabel}:</strong> ${colName} [${best.ratingGrade || best.badge}] — ${best.tacticalReason || best.headline} <em>(${this.t('bestNote')})</em>`;
    }
  }

  /**
   * Entfernt alle visuellen Best-Move Hervorhebungen vom Brett
   */
  clearBestMoveHint(resetFlag = true) {
    if (resetFlag) {
      this.isShowingBestMove = false;
    }

    // Alle Ghost-Discs vom Best-Move entfernen
    const hints = this.boardGridEl.querySelectorAll('.ghost-best-hint');
    hints.forEach(h => h.remove());

    // Slot-Highlights entfernen
    const hintSlots = this.boardGridEl.querySelectorAll('.best-hint-slot');
    hintSlots.forEach(s => s.classList.remove('best-hint-slot', 'hint-p1', 'hint-p2'));

    // Col-Button Highlights entfernen
    const hintCols = this.colSelectorsEl.querySelectorAll('.best-col-hint');
    hintCols.forEach(c => c.classList.remove('best-col-hint', 'hint-p1', 'hint-p2'));

    // Badges zurücksetzen
    this.clearColBadges();
    if (this.learnMode && this.currentAnalysis) {
      this.currentAnalysis.moves.forEach((m, c) => {
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
    }

    // Pop-Out Highlights entfernen
    const popBtns = this.popoutButtonsEl.querySelectorAll('.best-pop-hint');
    popBtns.forEach(b => b.classList.remove('best-pop-hint', 'hint-p1', 'hint-p2'));

    const popDiscs = this.boardGridEl.querySelectorAll('.best-pop-disc-hint');
    popDiscs.forEach(d => d.classList.remove('best-pop-disc-hint'));

    // Threat / Win Highlights entfernen
    const lines = this.boardGridEl.querySelectorAll('.win-highlight, .threat-highlight');
    lines.forEach(l => l.classList.remove('win-highlight', 'threat-highlight'));

    if (resetFlag) {
      if (this.btnShowBestLabelEl) this.btnShowBestLabelEl.textContent = this.t('showBestBtn');
      if (this.bestBtnIconEl) this.bestBtnIconEl.textContent = '💡';
      if (this.btnShowBestMoveEl) this.btnShowBestMoveEl.classList.remove('active-showing');
      if (this.btnRibbonBestEl) {
        this.btnRibbonBestEl.classList.remove('active-showing');
        this.btnRibbonBestEl.innerHTML = `<span>${this.t('ribbonBestBtn')}</span>`;
      }
      if (this.replayBestCardEl) {
        this.replayBestCardEl.style.display = 'none';
      }
    }
  }
}

// Initialisierung bei DOM-Bereitschaft
window.addEventListener('DOMContentLoaded', () => {
  window.game = new ConnectFourGame();
});
