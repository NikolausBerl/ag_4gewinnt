/**
 * Vier Gewinnt Deluxe — KI-Tutor Engine
 * Analysiert Spielzüge in Echtzeit mit Mehrzug-Vorausberechnung (Lookahead),
 * erklärt taktische Vor- und Nachteile, erkennt drohende Niederlagen 2 Züge im Voraus,
 * warnt vor offenen Dreierketten/Gabeln und empfiehlt präventive Blocks.
 */

const STRATEGY_LESSONS = [
  {
    id: 'center-control',
    number: 1,
    title_de: 'Die Macht des Zentrums (Zentrumskontrolle)',
    title_fr: 'La puissance du centre (Contrôle central)',
    tag_de: 'Eröffnung',
    tag_fr: 'Ouverture',
    icon: '🎯',
    summary_de: 'Spalte 4 (die mittlere Spalte) ist der Schlüssel zum Sieg!',
    summary_fr: 'La Colonne 4 (la colonne centrale) est la clé de la victoire !',
    proTip_de: 'Wenn du als Startspieler (Rot) beginnst, wirf deinen ersten Stein immer in die Mitte (Spalte 4)!',
    proTip_fr: 'Si vous commencez (Rouge), jouez toujours votre premier jeton au centre (Colonne 4) !',
    diagram: 'center'
  },
  {
    id: 'dont-blunder',
    number: 2,
    title_de: 'Die goldene Regel: Niemals Vorlagen liefern!',
    title_fr: 'Règle d\'or : ne jamais offrir de tremplin !',
    tag_de: 'Verteidigung',
    tag_fr: 'Défense',
    icon: '⚠️',
    summary_de: 'Prüfe vor JEDEM Zug das Feld direkt über deinem Stein!',
    summary_fr: 'Vérifiez avant CHAQUE coup la case directement au-dessus de votre jeton !',
    proTip_de: 'Vermeide Spalten, bei denen das direkt darüberliegende Feld dem Gegner einen Sofort-Gewinn ermöglicht!',
    proTip_fr: 'Évitez les colonnes où la case supérieure offre une victoire immédiate à l\'adversaire !',
    diagram: 'blunder'
  },
  {
    id: 'preemptive-defense',
    number: 3,
    title_de: 'Vorausschauende Verteidigung (Der Präventiv-Block)',
    title_fr: 'Défense préventive (Le blocage anticipé)',
    tag_de: 'Vorausblick',
    tag_fr: 'Anticipation',
    icon: '🛡️⚡',
    summary_de: 'Blockiere offene Dreierketten EINEN ZUG VORHER, bevor der 3. Stein liegt!',
    summary_fr: 'Bloquez les alignements de 3 UN COUP AVANT que le 3e jeton ne soit posé !',
    proTip_de: 'Warte niemals, bis eine Dreierkette an beiden Enden offen ist – blockiere sie bereits bei 2 Steinen!',
    proTip_fr: 'N\'attendez jamais qu\'un alignement soit ouvert des deux côtés — bloquez dès 2 jetons !',
    diagram: 'preemptive'
  },
  {
    id: 'forks',
    number: 4,
    title_de: 'Die Doppelbedrohung (Die "Gabel" / Fork)',
    title_fr: 'La double menace (La fourchette)',
    tag_de: 'Taktik',
    tag_fr: 'Tactique',
    icon: '⚡',
    summary_de: 'Erzwinge zwei Siegmöglichkeiten gleichzeitig!',
    summary_fr: 'Provoquez deux opportunités de victoire simultanées !',
    proTip_de: 'Verbinde horizontale und diagonale Linien so, dass sie sich kreuzen.',
    proTip_fr: 'Combinez des lignes horizontales et diagonales pour qu\'elles se croisent.',
    diagram: 'fork'
  },
  {
    id: 'open-threes',
    number: 5,
    title_de: 'Offene Dreierketten (Two-Way Streaks)',
    title_fr: 'Alignements de 3 ouverts (Menaces bilatérales)',
    tag_de: 'Angriff',
    tag_fr: 'Attaque',
    icon: '🌟',
    summary_de: 'Drei Steine mit zwei offenen Enden sind unaufhaltbar!',
    summary_fr: 'Trois jetons avec deux extrémités libres sont imparables !',
    proTip_de: 'Achte darauf, deine Steine frühzeitig so zu platzieren, dass zu beiden Seiten genügend freier Platz bleibt.',
    proTip_fr: 'Placez vos jetons tôt pour conserver assez d\'espace libre des deux côtés.',
    diagram: 'openthrees'
  },
  {
    id: 'parity',
    number: 6,
    title_de: 'Die Paritäts-Regel (Gerade vs. Ungerade Zeilen)',
    title_fr: 'La règle de parité (Lignes paires vs impaires)',
    tag_de: 'Meisterklasse',
    tag_fr: 'Niveau Expert',
    icon: '📏',
    summary_de: 'Rot liebt ungerade Zeilen – Gelb liebt gerade Zeilen!',
    summary_fr: 'Les Rouges visent les lignes impaires — les Jaunes les lignes paires !',
    proTip_de: 'Als Rot solltest du gezielt Drohungen auf den Zeilen 1, 3 und 5 anpeilen; als Gelb auf Zeilen 2 und 4.',
    proTip_fr: 'En Rouge, visez les lignes 1, 3 et 5 ; en Jaune, ciblez les lignes 2 et 4.',
    diagram: 'parity'
  }
];

class ConnectFourTutor {
  constructor(ai) {
    this.ai = ai;
    this.COLS = 7;
    this.ROWS = 6;
    this.lessons = STRATEGY_LESSONS;
    this.lang = 'de';
  }

  setLanguage(lang) {
    this.lang = lang || 'de';
  }

  t(key, params = {}) {
    if (typeof window !== 'undefined' && window.I18N && typeof window.I18N.t === 'function') {
      return window.I18N.t(key, params);
    }
    return key;
  }

  getLesson(idx, lang) {
    const l = this.lessons[idx] || this.lessons[0];
    const isFr = (lang === 'fr' || this.lang === 'fr' || (typeof window !== 'undefined' && window.I18N && window.I18N.currentLang === 'fr'));
    return {
      title: isFr ? l.title_fr : l.title_de,
      tag: isFr ? l.tag_fr : l.tag_de,
      summary: isFr ? l.summary_fr : l.summary_de,
      proTip: isFr ? l.proTip_fr : l.proTip_de,
      icon: l.icon,
      diagram: l.diagram
    };
  }

  /**
   * Vollständige taktische Gesamtanalyse des Spielfelds mit Mehrzug-Vorausberechnung (Lookahead).
   * Erkennt nicht nur Sofort-Niederlagen (Tiefe 1), sondern auch unausweichliche Niederlagen im übernächsten Zug
   * (offene Dreierketten/Gabeln des Gegners in Tiefe 2) und zeichnet präventive Rettungszüge aus.
   */
  analyzeBoard(board, currentPlayer, popOutActive = false) {
    const opponent = currentPlayer === 1 ? 2 : 1;

    // 1. Sofort-Gewinndrohungen des Gegners auf dem aktuellen Brett (Tiefe 1)
    const immediateOppThreats = [];
    for (let c = 0; c < this.COLS; c++) {
      const dropRow = this.ai.getDropRow(board, c);
      if (dropRow !== -1) {
        const oppSim = this.ai.applyMove(board, { action: 'drop', col: c }, opponent);
        if (this.ai.checkWin(oppSim) === opponent) {
          immediateOppThreats.push({
            col: c,
            row: dropRow,
            line: this.ai.findWinningLine(oppSim)
          });
        }
      }
    }

    // 2. Drohende Gabeln / offene Dreierketten des Gegners auf dem aktuellen Brett (Tiefe 2)
    // Welche Züge könnte der Gegner JETZT spielen, um eine unaufhaltbare 2-Wege-Bedrohung aufzubauen?
    const potentialOppForks = this.findPotentialOpponentForks(board, opponent, currentPlayer);

    // 3. Jede Drop-Spalte mit voller Mehrzug-Simulation bewerten
    const movesAnalysis = [];
    for (let col = 0; col < this.COLS; col++) {
      const moveEval = this.evaluateDropMove(
        board,
        col,
        currentPlayer,
        opponent,
        immediateOppThreats,
        potentialOppForks
      );
      movesAnalysis.push(moveEval);
    }

    // Optional: Pop-Out Züge analysieren
    const popOutsAnalysis = [];
    if (popOutActive) {
      for (let col = 0; col < this.COLS; col++) {
        if (this.ai.canPopOut(board, col, currentPlayer)) {
          const popEval = this.evaluatePopMove(board, col, currentPlayer, opponent, immediateOppThreats);
          popOutsAnalysis.push(popEval);
        }
      }
    }

    // Besten Zug ermitteln
    const validMoves = movesAnalysis.filter(m => !m.isFull);
    let bestMove = null;

    if (validMoves.length > 0) {
      const sorted = [...validMoves].sort((a, b) => b.score - a.score);
      bestMove = sorted[0];
      bestMove.isBest = true;
    }

    // Coach-Meldung mit Vorausschau generieren
    const coachMessage = this.generateCoachMessage(
      board,
      currentPlayer,
      bestMove,
      immediateOppThreats,
      potentialOppForks
    );

    return {
      moves: movesAnalysis,
      popOuts: popOutsAnalysis,
      bestMove,
      urgentThreats: immediateOppThreats,
      potentialOppForks,
      coachMessage,
      currentPlayer,
      opponent
    };
  }

  /**
   * Findet alle Züge des Gegners, die eine unlösbare Doppelbedrohung (2+ Gewinnfelder) erzeugen würden
   */
  findPotentialOpponentForks(board, opponent, player) {
    const forks = [];
    for (let c = 0; c < this.COLS; c++) {
      const dropRow = this.ai.getDropRow(board, c);
      if (dropRow !== -1) {
        const simBoard = this.ai.applyMove(board, { action: 'drop', col: c }, opponent);
        // Nach diesem Zug: Wie viele Sofort-Gewinnfelder hätte der Gegner?
        const winningSpots = this.findWinningSpots(simBoard, opponent);
        if (winningSpots.length >= 2) {
          // Hat der Spieler auf simBoard noch einen eigenen Sofort-Sieg zur Rettung?
          const playerImmediateWins = this.findWinningSpots(simBoard, player);
          if (playerImmediateWins.length === 0) {
            forks.push({
              col: c,
              row: dropRow,
              winningSpots,
              line: this.ai.findWinningLine(simBoard)
            });
          }
        }
      }
    }
    return forks;
  }

  /**
   * Präzise Bewertung eines einzelnen Einwurfs in Spalte col mit 2-Zug-Lookahead.
   */
  evaluateDropMove(board, col, player, opponent, immediateOppThreats, potentialOppForks) {
    const targetRow = this.ai.getDropRow(board, col);
    const colName = this.t('bestColTarget', { col: col + 1 });

    if (targetRow === -1) {
      return {
        action: 'drop',
        col,
        row: -1,
        isFull: true,
        type: 'FULL',
        ratingPercent: 0,
        ratingGrade: this.t('ratingNotPossible'),
        qualityLabel: this.t('colIsFullQuality'),
        badge: this.t('badgeFull'),
        badgeClass: 'badge-full',
        score: -999999,
        headline: this.t('tacticalColFullHeadline', { col: colName }),
        explanation: this.t('tacticalColFull'),
        tacticalReason: this.t('tacticalInvalid'),
        highlights: { targetCell: null, winLine: null, dangerCell: null, oppWinLine: null, forkTarget: null }
      };
    }

    const simBoard = this.ai.applyMove(board, { action: 'drop', col }, player);
    const targetCell = [targetRow, col];

    // =========================================================================
    // 1. TIEFE 1: EIGENER SOFORTIGER SIEG (100% / Perfekt)
    // =========================================================================
    if (this.ai.checkWin(simBoard) === player) {
      const winLine = this.ai.findWinningLine(simBoard);
      return {
        action: 'drop',
        col,
        row: targetRow,
        isFull: false,
        type: 'WIN',
        ratingPercent: 100,
        ratingGrade: this.t('tacticalWinGrade'),
        qualityLabel: this.t('tacticalWinQuality'),
        badge: '👑 100%',
        badgeClass: 'badge-win',
        score: 1000000,
        headline: this.t('tacticalWinHeadline', { col: colName }),
        explanation: this.t('tacticalWinExplanation', { row: 6 - targetRow }),
        tacticalReason: this.t('tacticalWin'),
        highlights: { targetCell, winLine, dangerCell: null, oppWinLine: null, forkTarget: null }
      };
    }

    // =========================================================================
    // 2. TIEFE 1: KANN DER GEGNER DIREKT IM NÄCHSTEN ZUG GEWINNEN? (0% Niederlage)
    // =========================================================================
    const oppWinsAfter = [];
    for (let c = 0; c < this.COLS; c++) {
      const oppDropRow = this.ai.getDropRow(simBoard, c);
      if (oppDropRow !== -1) {
        const oppSim = this.ai.applyMove(simBoard, { action: 'drop', col: c }, opponent);
        if (this.ai.checkWin(oppSim) === opponent) {
          oppWinsAfter.push({
            col: c,
            row: oppDropRow,
            line: this.ai.findWinningLine(oppSim)
          });
        }
      }
    }

    if (oppWinsAfter.length > 0) {
      // Fall 2A: Direkte Vorlage in derselben Spalte (Blunder)
      const directBlunder = oppWinsAfter.find(w => w.col === col);
      if (directBlunder) {
        return {
          action: 'drop',
          col,
          row: targetRow,
          isFull: false,
          type: 'BLUNDER',
          ratingPercent: 0,
          ratingGrade: this.t('tacticalBlunderGrade'),
          qualityLabel: this.t('tacticalBlunderQuality'),
          badge: '❌ 0%',
          badgeClass: 'badge-blunder',
          score: -900000,
          headline: this.t('tacticalBlunderHeadline', { col: colName }),
          explanation: this.t('tacticalBlunderDesc'),
          tacticalReason: this.t('tacticalFatalBlunder'),
          highlights: {
            targetCell,
            winLine: null,
            dangerCell: [targetRow - 1, col],
            oppWinLine: directBlunder.line,
            forkTarget: null
          }
        };
      }

      // Fall 2B: Ungeblockte gegnerische Drohung in einer anderen Spalte
      const unblocked = oppWinsAfter[0];
      const threatColName = this.t('bestColTarget', { col: unblocked.col + 1 });
      return {
        action: 'drop',
        col,
        row: targetRow,
        isFull: false,
        type: 'FATAL_IGNORE',
        ratingPercent: 0,
        ratingGrade: this.t('tacticalFatalLossGrade'),
        qualityLabel: this.t('tacticalFatalLossQuality'),
        badge: '💀 0%',
        badgeClass: 'badge-blunder',
        score: -950000,
        headline: this.t('tacticalFatalIgnoreHeadline', { threatCol: threatColName }),
        explanation: this.t('tacticalFatalIgnoreDesc', { col: colName, threatCol: threatColName }),
        tacticalReason: this.t('tacticalFatalLoss', { threatCol: threatColName }),
        highlights: {
          targetCell,
          winLine: null,
          dangerCell: [unblocked.row, unblocked.col],
          oppWinLine: unblocked.line,
          forkTarget: null
        }
      };
    }

    // =========================================================================
    // 3. TIEFE 1: PFLICHT-RETTUNG EINER SOFORTIGEN NIEDERLAGE (95%)
    // =========================================================================
    const wasThreatHere = immediateOppThreats.some(t => t.col === col);
    if (wasThreatHere) {
      const threat = immediateOppThreats.find(t => t.col === col);
      return {
        action: 'drop',
        col,
        row: targetRow,
        isFull: false,
        type: 'MUST_BLOCK',
        ratingPercent: 95,
        ratingGrade: this.t('tacticalMustBlockGrade'),
        qualityLabel: this.t('tacticalMustBlockQuality'),
        badge: '🛡️ 95%',
        badgeClass: 'badge-block',
        score: 600000,
        headline: this.t('tacticalMustBlockHeadline', { col: colName }),
        explanation: this.t('tacticalMustBlockDesc'),
        tacticalReason: this.t('tacticalForcedDefense'),
        highlights: {
          targetCell,
          winLine: null,
          dangerCell: null,
          oppWinLine: threat.line,
          forkTarget: null
        }
      };
    }

    // =========================================================================
    // 4. TIEFE 2 LOOKAHEAD: DROHT DER GEGNER MIT EINER UNLÖSBAREN GABEL IM ÜBERNÄCHSTEN ZUG?
    // =========================================================================
    // Prüfe: Kann der Gegner NACH unserem Zug eine Gabel / offene Dreierkette mit 2 Gewinnenden bauen?
    const oppForksAfterOurMove = this.findPotentialOpponentForks(simBoard, opponent, player);

    // FALL 4A: PRÄVENTIV-BLOCK (VORAUSSCHAUENDE VERTEIDIGUNG — 88%)
    // Der Gegner drohte auf dem Ausgangsbrett mit einer Gabel in dieser Spalte (potentialOppForks),
    // und unser Zug blockiert diese Gabel rechtzeitig, sodass der Gegner NIRGENDWO mehr eine Gabel bauen kann!
    const wasForkThreatHere = potentialOppForks.some(f => f.col === col);
    if (wasForkThreatHere && oppForksAfterOurMove.length === 0) {
      return {
        action: 'drop',
        col,
        row: targetRow,
        isFull: false,
        type: 'PREEMPTIVE_BLOCK',
        ratingPercent: 88,
        ratingGrade: this.t('tacticalPreemptiveGrade'),
        qualityLabel: this.t('tacticalPreemptiveQuality'),
        badge: '🛡️⚡ 88%',
        badgeClass: 'badge-block',
        score: 450000,
        headline: this.t('tacticalPreemptiveHeadline', { col: colName }),
        explanation: this.t('tacticalPreemptiveDesc'),
        tacticalReason: this.t('tacticalPreventFork'),
        highlights: {
          targetCell,
          winLine: null,
          dangerCell: null,
          oppWinLine: null,
          forkTarget: null
        }
      };
    }

    // FALL 4B: DIESER ZUG ERLAUBT EINE GEGNERISCHE GABEL IM ÜBERNÄCHSTEN ZUG! (15% — Drohende Niederlage)
    // Wenn wir hierhin spielen, baut der Gegner im Gegenzug eine unaufhaltbare 2-Wege-Drohung
    if (oppForksAfterOurMove.length > 0) {
      const lethalFork = oppForksAfterOurMove[0];
      const forkColName = this.t('bestColTarget', { col: lethalFork.col + 1 });
      const winCols = lethalFork.winningSpots.map(s => this.t('bestColTarget', { col: s + 1 })).join(' & ');

      return {
        action: 'drop',
        col,
        row: targetRow,
        isFull: false,
        type: 'ALLOWS_FORK',
        ratingPercent: 15,
        ratingGrade: this.t('tacticalAllowForkGrade'),
        qualityLabel: this.t('tacticalAllowForkQuality'),
        badge: '🛑 15%',
        badgeClass: 'badge-risky',
        score: -500000,
        headline: this.t('tacticalAllowForkHeadline'),
        explanation: this.t('tacticalAllowForkDesc', { col: colName, forkCol: forkColName, winCols }),
        tacticalReason: this.t('tacticalAllowFork', { forkCol: forkColName }),
        highlights: {
          targetCell,
          winLine: null,
          dangerCell: [lethalFork.row, lethalFork.col],
          oppWinLine: null,
          forkTarget: lethalFork
        }
      };
    }

    // =========================================================================
    // 5. STRATEGISCHE BEWERTUNG ZWISCHEN "SEHR GUT" UND "MÄSSIG/SCHWACH"
    // =========================================================================

    // A) Eigene Doppelbedrohung / Gabel (Fork — 90%)
    const forkSpots = this.findWinningSpots(simBoard, player);
    if (forkSpots.length >= 2) {
      const forkColNames = forkSpots.map(c => this.t('bestColTarget', { col: c + 1 })).join(' & ');
      return {
        action: 'drop',
        col,
        row: targetRow,
        isFull: false,
        type: 'FORK',
        ratingPercent: 90,
        ratingGrade: this.t('tacticalForkGrade'),
        qualityLabel: this.t('tacticalForkQuality'),
        badge: '⚡ 90%',
        badgeClass: 'badge-fork',
        score: 300000 + forkSpots.length * 10000,
        headline: this.t('tacticalForkHeadline', { col: colName }),
        explanation: this.t('tacticalForkDesc', { col: colName, forkCols: forkColNames }),
        tacticalReason: this.t('tacticalCreateFork'),
        highlights: { targetCell, winLine: null, dangerCell: null, oppWinLine: null, forkTarget: null, forkCols: forkSpots }
      };
    }

    // B) Eigene Offene Dreierkette (Two-Way Streak — 82%)
    const openThrees = this.countOpenThrees(simBoard, player);
    const prevOpenThrees = this.countOpenThrees(board, player);
    const createdOpenThree = (openThrees > prevOpenThrees);

    // C) Heuristische Stellungs- und Zentrumsbewertung
    let baseScore = this.ai.evaluateBoard(simBoard, player, opponent);

    let centerBonus = 0;
    if (col === 3) centerBonus = 450;
    else if (col === 2 || col === 4) centerBonus = 220;
    else if (col === 1 || col === 5) centerBonus = 50;
    else centerBonus = -120;

    let finalScore = baseScore + centerBonus;
    if (createdOpenThree) finalScore += 5000;

    if (createdOpenThree) {
      return {
        action: 'drop',
        col,
        row: targetRow,
        isFull: false,
        type: 'STRONG_ATTACK',
        ratingPercent: 82,
        ratingGrade: this.t('tacticalAttackGrade'),
        qualityLabel: this.t('tacticalAttackQuality'),
        badge: '🌟 82%',
        badgeClass: 'badge-strong',
        score: 100000 + finalScore,
        headline: this.t('tacticalAttackHeadline', { col: colName }),
        explanation: this.t('tacticalAttackDesc'),
        tacticalReason: this.t('tacticalAttackBuild'),
        highlights: { targetCell, winLine: null, dangerCell: null, oppWinLine: null, forkTarget: null }
      };
    }

    if (col === 3 && finalScore >= 0) {
      return {
        action: 'drop',
        col,
        row: targetRow,
        isFull: false,
        type: 'CENTER',
        ratingPercent: 75,
        ratingGrade: this.t('tacticalCenterGrade'),
        qualityLabel: this.t('tacticalCenterQuality'),
        badge: '⭐ 75%',
        badgeClass: 'badge-best',
        score: 50000 + finalScore,
        headline: this.t('tacticalCenterHeadline', { col: colName }),
        explanation: this.t('tacticalCenterDesc'),
        tacticalReason: this.t('tacticalCenterControl'),
        highlights: { targetCell, winLine: null, dangerCell: null, oppWinLine: null, forkTarget: null }
      };
    }

    if ((col === 2 || col === 4) && finalScore >= 0) {
      return {
        action: 'drop',
        col,
        row: targetRow,
        isFull: false,
        type: 'SOLID',
        ratingPercent: 65,
        ratingGrade: this.t('tacticalSolidGrade'),
        qualityLabel: this.t('tacticalSolidQuality'),
        badge: '👍 65%',
        badgeClass: 'badge-good',
        score: 30000 + finalScore,
        headline: this.t('tacticalSolidHeadline', { col: colName }),
        explanation: this.t('tacticalSolidDesc'),
        tacticalReason: this.t('tacticalSolidPosition'),
        highlights: { targetCell, winLine: null, dangerCell: null, oppWinLine: null, forkTarget: null }
      };
    }

    if (col === 1 || col === 5) {
      const isPos = finalScore >= 0;
      return {
        action: 'drop',
        col,
        row: targetRow,
        isFull: false,
        type: isPos ? 'NEUTRAL' : 'RISKY',
        ratingPercent: isPos ? 50 : 38,
        ratingGrade: isPos ? this.t('tacticalFlankPassableGrade') : this.t('tacticalFlankRiskyGrade'),
        qualityLabel: isPos ? this.t('tacticalFlankPassableQuality') : this.t('tacticalFlankRiskyQuality'),
        badge: isPos ? '🟡 50%' : '⚠️ 38%',
        badgeClass: isPos ? 'badge-neutral' : 'badge-risky',
        score: 10000 + finalScore,
        headline: isPos ? this.t('tacticalFlankPassableHeadline', { col: colName }) : this.t('tacticalFlankRiskyHeadline', { col: colName }),
        explanation: isPos ? this.t('tacticalFlankPassableDesc') : this.t('tacticalFlankRiskyDesc'),
        tacticalReason: isPos ? this.t('tacticalPassiveFlank') : this.t('tacticalUnfavorable'),
        highlights: { targetCell, winLine: null, dangerCell: null, oppWinLine: null, forkTarget: null }
      };
    }

    // Randspalten (0 und 6)
    return {
      action: 'drop',
      col,
      row: targetRow,
      isFull: false,
      type: 'EDGE',
      ratingPercent: 28,
      ratingGrade: this.t('tacticalEdgeGrade'),
      qualityLabel: this.t('tacticalEdgeQuality'),
      badge: '⚠️ 28%',
      badgeClass: 'badge-risky',
      score: finalScore,
      headline: this.t('tacticalEdgeHeadline', { col: colName }),
      explanation: this.t('tacticalEdgeDesc'),
      tacticalReason: this.t('tacticalEdgeMove'),
      highlights: { targetCell, winLine: null, dangerCell: null, oppWinLine: null, forkTarget: null }
    };
  }

  /**
   * Analyse eines Pop-Out Zugs (Zusatzregel)
   */
  evaluatePopMove(board, col, player, opponent, immediateOppThreats) {
    const colName = this.t('bestColTarget', { col: col + 1 });
    const simBoard = this.ai.applyMove(board, { action: 'pop', col }, player);

    // Führt eigener Pop-Out zum eigenen Sieg?
    if (this.ai.checkWin(simBoard) === player) {
      return {
        action: 'pop',
        col,
        type: 'WIN',
        ratingPercent: 100,
        ratingGrade: this.t('tacticalWinGrade'),
        qualityLabel: this.t('popWinQuality'),
        badge: this.t('badgePopWin'),
        badgeClass: 'badge-win',
        score: 950000,
        headline: this.t('popWinHeadline', { col: colName }),
        explanation: this.t('popWinDesc'),
        tacticalReason: this.t('tacticalPopoutWin')
      };
    }

    // Führt eigener Pop-Out zum GEGNER-Sieg?
    if (this.ai.checkWin(simBoard) === opponent) {
      return {
        action: 'pop',
        col,
        type: 'BLUNDER',
        ratingPercent: 0,
        ratingGrade: this.t('ratingLoss'),
        qualityLabel: this.t('popBlunderQuality'),
        badge: '❌ 0%',
        badgeClass: 'badge-blunder',
        score: -900000,
        headline: this.t('popBlunderHeadline', { col: colName }),
        explanation: this.t('popBlunderDesc'),
        tacticalReason: this.t('tacticalPopoutBlunder')
      };
    }

    return {
      action: 'pop',
      col,
      type: 'SOLID',
      ratingPercent: 50,
      ratingGrade: this.t('popNeutralGrade'),
      qualityLabel: this.t('popNeutralQuality'),
      badge: this.t('badgePopOut'),
      badgeClass: 'badge-neutral',
      score: 100,
      headline: this.t('popNeutralHeadline', { col: colName }),
      explanation: this.t('popWinDesc'),
      tacticalReason: this.t('tacticalPopoutChange')
    };
  }

  /**
   * Findet alle Spalten, in denen ein Spieler im nächsten Zug sofort gewinnen könnte
   */
  findWinningSpots(board, player) {
    const spots = [];
    for (let c = 0; c < this.COLS; c++) {
      if (board[0][c] === 0) {
        const testBoard = this.ai.applyMove(board, { action: 'drop', col: c }, player);
        if (this.ai.checkWin(testBoard) === player) {
          spots.push(c);
        }
      }
    }
    return spots;
  }

  /**
   * Zählt offene Dreierketten (3 Steine mit freien Feldern an beiden Enden)
   */
  countOpenThrees(board, player) {
    let count = 0;

    // Horizontal: [0, P, P, P, 0]
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c <= this.COLS - 5; c++) {
        if (
          board[r][c] === 0 &&
          board[r][c+1] === player &&
          board[r][c+2] === player &&
          board[r][c+3] === player &&
          board[r][c+4] === 0
        ) {
          count++;
        }
      }
    }

    return count;
  }

  /**
   * Erzeugt eine motivierende, situationsgerechte Tutor-Nachricht mit Vorausschau
   */
  generateCoachMessage(board, currentPlayer, bestMove, urgentThreats, potentialOppForks) {
    const totalDiscs = 42 - this.ai.countEmptyCells(board);

    // 1. ZWEI ODER MEHR AKUTE DROHUNGEN (Doppelbedrohung aktiv = zwei Totenköpfe)
    if (urgentThreats.length >= 2) {
      const threatCols = urgentThreats.map(t => this.t('bestColTarget', { col: t.col + 1 })).join(' & ');
      return {
        mood: 'alarm',
        icon: '💀',
        title: this.t('coachDoubleThreatTitle'),
        text: this.t('coachDoubleThreatText', { threatCols })
      };
    }

    // 2. Genau EINE akute Lebensgefahr: Gegner kann sofort gewinnen
    if (urgentThreats.length === 1) {
      const threat = urgentThreats[0];
      const colName = this.t('bestColTarget', { col: threat.col + 1 });
      return {
        mood: 'alarm',
        icon: '🚨',
        title: this.t('coachRedAlertTitle'),
        text: this.t('coachRedAlertText', { col: colName })
      };
    }

    // 3. VORAUSBLICK: Drohende Gegner-Gabel im übernächsten Zug
    if (potentialOppForks && potentialOppForks.length > 0) {
      const forkCols = potentialOppForks.map(f => this.t('bestColTarget', { col: f.col + 1 })).join(', ');
      return {
        mood: 'warning',
        icon: '🛡️⚡',
        title: this.t('coachPreventForkTitle'),
        text: this.t('coachPreventForkText', { forkCols })
      };
    }

    // 4. Wir können sofort gewinnen!
    if (bestMove && bestMove.type === 'WIN') {
      const colName = this.t('bestColTarget', { col: bestMove.col + 1 });
      return {
        mood: 'victory',
        icon: '🏆',
        title: this.t('coachWinReadyTitle'),
        text: this.t('coachWinReadyText', { col: colName })
      };
    }

    // 5. Gabel entdeckt!
    if (bestMove && bestMove.type === 'FORK') {
      const colName = this.t('bestColTarget', { col: bestMove.col + 1 });
      return {
        mood: 'excited',
        icon: '⚡',
        title: this.t('coachForkTitle'),
        text: this.t('coachForkText', { col: colName })
      };
    }

    // 6. Eröffnungsphase (Erste 4 Züge)
    if (totalDiscs < 4) {
      return {
        mood: 'learning',
        icon: '🌟',
        title: this.t('coachOpeningTitle'),
        text: this.t('coachOpeningText')
      };
    }

    // 7. Mittelspiel
    if (totalDiscs >= 4 && totalDiscs <= 16) {
      const rec = bestMove ? this.t('bestColTarget', { col: bestMove.col + 1 }) : this.t('centerColName');
      return {
        mood: 'thinking',
        icon: '💡',
        title: this.t('coachMidgameTitle'),
        text: this.t('coachMidgameText', { rec })
      };
    }

    // 8. Endspiel
    return {
      mood: 'tactical',
      icon: '♟️',
      title: this.t('coachEndgameTitle'),
      text: this.t('coachEndgameText')
    };
  }

  /**
   * Liefert alle Grundstrategien für das Lexikon-Modal
   */
  getLessons() {
    return this.lessons;
  }
}

// Global registrieren
window.ConnectFourTutor = ConnectFourTutor;
window.STRATEGY_LESSONS = STRATEGY_LESSONS;
