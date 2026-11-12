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
    title: 'Die Macht des Zentrums (Zentrumskontrolle)',
    tag: 'Eröffnung',
    icon: '🎯',
    summary: 'Spalte 4 (die mittlere Spalte) ist der Schlüssel zum Sieg!',
    description: `
      Ein Vier-Gewinnt-Spielfeld besitzt insgesamt 69 mögliche Gewinnlinien. 
      Ganze <strong>16 dieser Linien</strong> verlaufen durch die mittlere Spalte (Spalte 4)!
      Zum Vergleich: Durch die beiden Außenränder (Spalte 1 und 7) verlaufen jeweils nur magere 3 Gewinnlinien.
      Wer das Zentrum beherrscht, hat fast unbegrenzte Kombinationsmöglichkeiten in alle Richtungen – 
      horizontal, vertikal und über beide Diagonalen.
    `,
    proTip: 'Wenn du als Startspieler (Rot) beginnst, wirf deinen ersten Stein immer in die Mitte (Spalte 4)!',
    diagram: 'center'
  },
  {
    id: 'dont-blunder',
    number: 2,
    title: 'Die goldene Regel: Niemals Vorlagen liefern!',
    tag: 'Verteidigung',
    icon: '⚠️',
    summary: 'Prüfe vor JEDEM Zug das Feld direkt über deinem Stein!',
    description: `
      Der mit Abstand häufigste Grund für Niederlagen ist der sogenannte <em>Blunder</em> (die Vorlage):
      Du wirfst einen Stein ein, und dieser Stein dient dem Gegner im nächsten Zug als perfekte Treppenstufe, 
      um direkt auf das Feld darüber zu setzen und seine 4er-Kette zu vollenden!
      Ein guter Spieler prüft immer: <em>"Was passiert, wenn der Gegner auf meinen Stein draufsetzt?"</em>
    `,
    proTip: 'Vermeide Spalten, bei denen das direkt darüberliegende Feld dem Gegner einen Sofort-Gewinn ermöglicht!',
    diagram: 'blunder'
  },
  {
    id: 'preemptive-defense',
    number: 3,
    title: 'Vorausschauende Verteidigung (Der Präventiv-Block)',
    tag: 'Vorausblick',
    icon: '🛡️⚡',
    summary: 'Blockiere offene Dreierketten EINEN ZUG VORHER, bevor der 3. Stein liegt!',
    description: `
      Hat der Gegner zwei Steine in einer Reihe mit freiem Platz an beiden Enden (z. B. <code>_ O O _ _</code>), 
      droht akute Gefahr: Setzt der Gegner den 3. Stein, entsteht eine <strong>offene Dreierkette mit zwei offenen Enden</strong>. 
      Danach hast du ZWEI Totenköpfe auf dem Brett und die Niederlage ist unausweichlich!
      Die Meistertaktik: <strong>Präventiv-Block!</strong> Setze sofort hinein, bevor der Gegner den 3. Stein legen kann.
    `,
    proTip: 'Warte niemals, bis eine Dreierkette an beiden Enden offen ist – blockiere sie bereits bei 2 Steinen!',
    diagram: 'preemptive'
  },
  {
    id: 'forks',
    number: 4,
    title: 'Die Doppelbedrohung (Die "Gabel" / Fork)',
    tag: 'Taktik',
    icon: '⚡',
    summary: 'Erzwinge zwei Siegmöglichkeiten gleichzeitig!',
    description: `
      Eine Gabel entsteht, wenn du mit einem einzigen Zug ZWEI voneinander unabhängige Gewinnfelder eröffnest.
      Da der Gegner in seinem Zug immer nur einen einzigen Stein setzen kann, 
      kann er unmöglich beide Drohungen gleichzeitig abwehren.
      Eine erfolgreich gelegte Gabel bedeutet den sicheren Sieg!
    `,
    proTip: 'Verbinde horizontale und diagonale Linien so, dass sie sich kreuzen.',
    diagram: 'fork'
  },
  {
    id: 'open-threes',
    number: 5,
    title: 'Offene Dreierketten (Two-Way Streaks)',
    tag: 'Angriff',
    icon: '🌟',
    summary: 'Drei Steine mit zwei offenen Enden sind unaufhaltbar!',
    description: `
      Wenn du drei Steine in einer Reihe hast und BEIDE Enden frei sind (z. B. <code>_ O O O _</code>), 
      hast du das Spiel praktisch gewonnen – es sei denn, der Gegner kann schneller gewinnen.
      Blockiert der Gegner das linke Ende, gewinnst du am rechten Ende (und umgekehrt).
    `,
    proTip: 'Achte darauf, deine Steine frühzeitig so zu platzieren, dass zu beiden Seiten genügend freier Platz bleibt.',
    diagram: 'openthrees'
  },
  {
    id: 'parity',
    number: 6,
    title: 'Die Paritäts-Regel (Gerade vs. Ungerade Zeilen)',
    tag: 'Meisterklasse',
    icon: '📏',
    summary: 'Rot liebt ungerade Zeilen – Gelb liebt gerade Zeilen!',
    description: `
      Das Spielfeld hat 6 Zeilen (von unten: 1, 2, 3, 4, 5, 6).
      Da Spieler 1 (Rot) immer anfängt, wird Rot bei voll werdenden Spalten immer die ungeraden Zeilen (1, 3, 5) besetzen!
      Spieler 2 (Gelb) landet auf den geraden Zeilen (2, 4, 6).
      Wenn Rot eine Siegdrohung auf einer ungeraden Zeile aufbaut, muss Gelb aufpassen: Gelb kann diese Zeile meist nicht kontrollieren.
    `,
    proTip: 'Als Rot solltest du gezielt Drohungen auf den Zeilen 1, 3 und 5 anpeilen; als Gelb auf Zeilen 2 und 4.',
    diagram: 'parity'
  }
];

class ConnectFourTutor {
  constructor(ai) {
    this.ai = ai;
    this.COLS = 7;
    this.ROWS = 6;
    this.lessons = STRATEGY_LESSONS;
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
    const colName = `Spalte ${col + 1}`;

    if (targetRow === -1) {
      return {
        action: 'drop',
        col,
        row: -1,
        isFull: true,
        type: 'FULL',
        ratingPercent: 0,
        ratingGrade: '0% — Nicht möglich',
        qualityLabel: 'Spalte voll',
        badge: 'Voll',
        badgeClass: 'badge-full',
        score: -999999,
        headline: `${colName} ist voll`,
        explanation: 'In diese Spalte passt kein Stein mehr hinein.',
        tacticalReason: 'Ungültiger Zug.',
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
        ratingGrade: '100% — Siegzug',
        qualityLabel: 'Siegzug (Perfekt)',
        badge: '👑 100%',
        badgeClass: 'badge-win',
        score: 1000000,
        headline: `Siegzug in ${colName}!`,
        explanation: `Mit diesem Einwurf vollendest du sofort deine 4er-Kette auf Zeile ${6 - targetRow} und gewinnst das Spiel!`,
        tacticalReason: 'Sofortiger Spielgewinn (100% — Bester Zug).',
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
          ratingGrade: '0% — Niederlage',
          qualityLabel: 'Tödliche Vorlage (0%)',
          badge: '❌ 0%',
          badgeClass: 'badge-blunder',
          score: -900000,
          headline: `Tödliche Vorlage in ${colName}!`,
          explanation: `Vorsicht Falle! Dein Stein dient dem Gegner als direkte Treppenstufe auf Zeile ${6 - (targetRow - 1)}. Der Gegner setzt sofort darauf und gewinnt das Spiel!`,
          tacticalReason: 'Tödlicher Fehler (0%): Baut dem Gegner die Vorlage für den Sofort-Sieg.',
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
      const threatColName = `Spalte ${unblocked.col + 1}`;
      return {
        action: 'drop',
        col,
        row: targetRow,
        isFull: false,
        type: 'FATAL_IGNORE',
        ratingPercent: 0,
        ratingGrade: '0% — Niederlage',
        qualityLabel: 'Tödlicher Fehler (0%)',
        badge: '💀 0%',
        badgeClass: 'badge-blunder',
        score: -950000,
        headline: `Tödlicher Fehler: Gegner gewinnt in ${threatColName}!`,
        explanation: `Wenn du in ${colName} spielst, blockst du nicht die gegnerische 4er-Kette in ${threatColName}! Der Gegner setzt im nächsten Zug dort ein und gewinnt sofort das Spiel.`,
        tacticalReason: `Führt zur sofortigen Niederlage (0%): Lässt den gegnerischen Siegzug in ${threatColName} ungehindert zu.`,
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
        ratingGrade: '95% — Pflicht-Rettung',
        qualityLabel: 'Pflicht-Rettung (Bester Zug)',
        badge: '🛡️ 95%',
        badgeClass: 'badge-block',
        score: 600000,
        headline: `Lebenswichtige Rettung in ${colName}!`,
        explanation: `Dieser Zug ist deine einzige Rettung! Der Gegner hatte hier bereits 3 Steine in einer Reihe. Durch deinen Block wendest du die unmittelbare Niederlage erfolgreich ab.`,
        tacticalReason: 'Erfolgreiche Pflicht-Verteidigung (95%): Wehrt die drohende Niederlage ab.',
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
        ratingGrade: '88% — Präventiv-Block',
        qualityLabel: 'Präventiv-Block (Top)',
        badge: '🛡️⚡ 88%',
        badgeClass: 'badge-block',
        score: 450000,
        headline: `Präventiv-Block in ${colName}!`,
        explanation: `Vorausschauende Meister-Verteidigung! Wenn du hier nicht blockst, baut der Gegner im nächsten Zug eine offene Dreierkette mit zwei freien Enden. Dein Zug erstickt diese tödliche Doppelbedrohung rechtzeitig im Keim!`,
        tacticalReason: 'Vorausschauende Rettung (88%): Verhindert eine unlösbare gegnerische Gabel im übernächsten Zug.',
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
      const forkColName = `Spalte ${lethalFork.col + 1}`;
      const winCols = lethalFork.winningSpots.map(s => `Spalte ${s + 1}`).join(' und ');

      return {
        action: 'drop',
        col,
        row: targetRow,
        isFull: false,
        type: 'ALLOWS_FORK',
        ratingPercent: 15,
        ratingGrade: '15% — Verliert in 2 Zügen',
        qualityLabel: 'Gegner-Gabel droht (15%)',
        badge: '🛑 15%',
        badgeClass: 'badge-risky',
        score: -500000,
        headline: `Gefahr im übernächsten Zug: Gegner-Gabel droht!`,
        explanation: `Achtung Vorausblick: Wenn du in ${colName} spielst, kann der Gegner im Gegenzug in ${forkColName} eine offene Dreierkette / Gabel legen! Danach hat der Gegner ZWEI Gewinnfelder gleichzeitig (${winCols}), und du verlierst unweigerlich.`,
        tacticalReason: `Führt zur Niederlage in 2 Zügen (15%): Erlaubt dem Gegner eine unaufhaltbare Doppelbedrohung in ${forkColName}.`,
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
      const forkColNames = forkSpots.map(c => `Spalte ${c + 1}`).join(' und ');
      return {
        action: 'drop',
        col,
        row: targetRow,
        isFull: false,
        type: 'FORK',
        ratingPercent: 90,
        ratingGrade: '90% — Hervorragend',
        qualityLabel: 'Hervorragend (Gabel)',
        badge: '⚡ 90%',
        badgeClass: 'badge-fork',
        score: 300000 + forkSpots.length * 10000,
        headline: `Doppelbedrohung (Gabel) in ${colName}!`,
        explanation: `Genialer Taktikzug! Dieser Stein eröffnet zwei getrennte Gewinnfelder gleichzeitig (${forkColNames}). Der Gegner kann nur eines blockieren – dein Sieg ist unausweichlich!`,
        tacticalReason: 'Unlösbare Zwickmühle (90%): Erzeugt zwei gleichzeitige Siegchancen.',
        highlights: { targetCell, winLine: null, dangerCell: null, oppWinLine: null, forkTarget: null, forkCols: forkSpots }
      };
    }

    // B) Eigene Offene Dreierkette (Two-Way Streak — 82%)
    const openThrees = this.countOpenThrees(simBoard, player);
    const prevOpenThrees = this.countOpenThrees(board, player);
    const createdOpenThree = (openThrees > prevOpenThrees);

    // C) Heuristische Stellungs- und Zentrumsbewertung
    let baseScore = this.ai.evaluateBoard(simBoard, player, opponent);
    if (player === 2) baseScore = -baseScore;

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
        ratingGrade: '82% — Sehr stark',
        qualityLabel: 'Sehr stark (Offene 3er)',
        badge: '🌟 82%',
        badgeClass: 'badge-strong',
        score: 100000 + finalScore,
        headline: `Offene Dreierkette in ${colName}!`,
        explanation: `Du baust eine Dreierkette mit freien Enden auf. Das setzt den Gegner massiv unter Druck und erzwingt Verteidigungszüge.`,
        tacticalReason: 'Aggressiver Angriffsaufbau (82%): Hohe Durchschlagskraft.',
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
        ratingGrade: '75% — Sehr gut',
        qualityLabel: 'Sehr gut (Zentrum)',
        badge: '⭐ 75%',
        badgeClass: 'badge-best',
        score: 50000 + finalScore,
        headline: `Zentrumskontrolle in ${colName}`,
        explanation: `Die Mitte ist das Herzstück des Spiels. Von Spalte 4 kreuzen 16 mögliche 4er-Ketten in alle Richtungen – das ist das maximale Angriffspotenzial.`,
        tacticalReason: 'Dominante Zentrumskontrolle (75%): Maximale Kombinationsvielfalt.',
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
        ratingGrade: '65% — Gut',
        qualityLabel: 'Gut (Solide)',
        badge: '👍 65%',
        badgeClass: 'badge-good',
        score: 30000 + finalScore,
        headline: `Solider Aufbau in ${colName}`,
        explanation: `Gute Feldkontrolle im erweiterten Zentrum (13 potentielle Viererketten) ohne Risiko einer gegnerischen Vorlage.`,
        tacticalReason: 'Solider Stellungsaufbau (65%): Sichere Positionsverbesserung.',
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
        ratingGrade: isPos ? '50% — Passabel' : '38% — Riskant',
        qualityLabel: isPos ? 'Passabel (Mäßig)' : 'Riskant (Schwach)',
        badge: isPos ? '🟡 50%' : '⚠️ 38%',
        badgeClass: isPos ? 'badge-neutral' : 'badge-risky',
        score: 10000 + finalScore,
        headline: isPos ? `Passabler Flankenzug in ${colName}` : `Riskante Position in ${colName}`,
        explanation: isPos
          ? `Flankenposition mit mäßigem Einfluss auf das Zentrum (7 mögliche Ketten).`
          : `Dieser Zug bringt dir wenig Raumgewinn und könnte deine Stellung langfristig schwächen.`,
        tacticalReason: isPos ? 'Passiver Flankenzug (50%).' : 'Taktisch ungünstige Feldwahl (38%).',
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
      ratingGrade: '28% — Schwach',
      qualityLabel: 'Schwach (Randzug)',
      badge: '⚠️ 28%',
      badgeClass: 'badge-risky',
      score: finalScore,
      headline: `Schwacher Randzug in ${colName}`,
      explanation: `Am Außenrand verlaufen nur magere 3 Viererketten. Randzüge haben im Eröffnungs- und Mittelspiel selten Durchschlagskraft.`,
      tacticalReason: 'Wenig dynamischer Randzug (28%): Geringes strategisches Potenzial.',
      highlights: { targetCell, winLine: null, dangerCell: null, oppWinLine: null, forkTarget: null }
    };
  }

  /**
   * Analyse eines Pop-Out Zugs (Zusatzregel)
   */
  evaluatePopMove(board, col, player, opponent, immediateOppThreats) {
    const colName = `Spalte ${col + 1}`;
    const simBoard = this.ai.applyMove(board, { action: 'pop', col }, player);

    // Führt eigener Pop-Out zum eigenen Sieg?
    if (this.ai.checkWin(simBoard) === player) {
      return {
        action: 'pop',
        col,
        type: 'WIN',
        ratingPercent: 100,
        ratingGrade: '100% — Siegzug',
        qualityLabel: 'Pop-Siegzug',
        badge: '👑 Pop-Sieg',
        badgeClass: 'badge-win',
        score: 950000,
        headline: `Gewinnbringender Pop-Out in ${colName}!`,
        explanation: `Wenn du den untersten Stein herausziehst, fallen deine oberen Steine genau zu einer 4er-Reihe zusammen!`,
        tacticalReason: 'Überraschender Kettenreaktions-Sieg durch Pop-Out (100%).'
      };
    }

    // Führt eigener Pop-Out zum GEGNER-Sieg?
    if (this.ai.checkWin(simBoard) === opponent) {
      return {
        action: 'pop',
        col,
        type: 'BLUNDER',
        ratingPercent: 0,
        ratingGrade: '0% — Niederlage',
        qualityLabel: 'Fataler Pop-Out',
        badge: '❌ 0%',
        badgeClass: 'badge-blunder',
        score: -900000,
        headline: `Gefährlicher Pop-Out in ${colName}!`,
        explanation: `Achtung Katastrophe! Wenn du deinen Stein unten herausziehst, rutscht ein gegnerischer Stein genau in eine 4er-Gewinnreihe!`,
        tacticalReason: 'Tödliche Kettenreaktion (0%): Schenkt dem Gegner sofort den Sieg.'
      };
    }

    return {
      action: 'pop',
      col,
      type: 'SOLID',
      ratingPercent: 50,
      ratingGrade: '50% — Neutral',
      qualityLabel: 'Pop-Out',
      badge: '▲ Pop-Out',
      badgeClass: 'badge-neutral',
      score: 100,
      headline: `Pop-Out in ${colName}`,
      explanation: `Zieht deinen untersten Stein heraus und lässt die Steine darüber nach unten rutschen.`,
      tacticalReason: 'Verändert die Spaltenhöhen und bricht eventuell Linien auf.'
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
      const threatCols = urgentThreats.map(t => 'Spalte ' + (t.col + 1)).join(' und ');
      return {
        mood: 'alarm',
        icon: '💀',
        title: 'Doppelbedrohung aktiv!',
        text: `Der Gegner besitzt eine offene Dreierkette mit ZWEI Gewinnfeldern (${threatCols}). Da du pro Runde nur ein Feld blockieren kannst, gewinnt der Gegner am anderen Ende. Lektion: Solche Ketten müssen immer EINEN ZUG VORHER (Präventiv-Block) gestoppt werden!`
      };
    }

    // 2. Genau EINE akute Lebensgefahr: Gegner kann sofort gewinnen
    if (urgentThreats.length === 1) {
      const threat = urgentThreats[0];
      return {
        mood: 'alarm',
        icon: '🚨',
        title: 'Alarmstufe Rot!',
        text: `Der Gegner droht mit einem Sofort-Gewinn in Spalte ${threat.col + 1}! Du musst diese Spalte jetzt unbedingt mit der Pflicht-Rettung blockieren!`
      };
    }

    // 3. VORAUSBLICK: Drohende Gegner-Gabel im übernächsten Zug
    if (potentialOppForks && potentialOppForks.length > 0) {
      const forkCols = potentialOppForks.map(f => 'Spalte ' + (f.col + 1)).join(', ');
      return {
        mood: 'warning',
        icon: '🛡️⚡',
        title: 'Vorausblick: Gabel verhindern!',
        text: `Achtung: Der Gegner bereitet eine offene Dreierkette / Gabel in ${forkCols} vor! Wenn du nicht jetzt präventiv blockst, droht im übernächsten Zug die unaufhaltbare Niederlage.`
      };
    }

    // 4. Wir können sofort gewinnen!
    if (bestMove && bestMove.type === 'WIN') {
      return {
        mood: 'victory',
        icon: '🏆',
        title: 'Siegzug bereit!',
        text: `Du hast das Spiel in der Hand! Setze in Spalte ${bestMove.col + 1}, um deine Viererkette zu vollenden und zu gewinnen.`
      };
    }

    // 5. Gabel entdeckt!
    if (bestMove && bestMove.type === 'FORK') {
      return {
        mood: 'excited',
        icon: '⚡',
        title: 'Taktische Zwickmühle!',
        text: `Nutze Spalte ${bestMove.col + 1}! Damit stellst du eine unlösbare Doppelbedrohung (Gabel) auf. Der Gegner kann nicht beide Wege verteidigen.`
      };
    }

    // 6. Eröffnungsphase (Erste 4 Züge)
    if (totalDiscs < 4) {
      return {
        mood: 'learning',
        icon: '🎯',
        title: 'Eröffnungsphase: Zentrum!',
        text: `In den ersten Zügen gilt die oberste Regel: Besetze die Mitte (Spalte 4)! Wer das Zentrum früh kontrolliert, dominiert das gesamte Spiel.`
      };
    }

    // 7. Mittelspiel
    if (totalDiscs >= 4 && totalDiscs <= 16) {
      return {
        mood: 'thinking',
        icon: '💡',
        title: 'Mittelspiel: Vorlagen meiden',
        text: `Baue eigene Reihen auf, aber prüfe immer: Kann der Gegner auf deinen Stein draufsetzen? Empfehlung: ${bestMove ? 'Spalte ' + (bestMove.col + 1) : 'Mitte'}.`
      };
    }

    // 8. Endspiel
    return {
      mood: 'tactical',
      icon: '♟️',
      title: 'Endspiel: Präzision zählt!',
      text: `Das Brett füllt sich. Berechne jeden Zug voraus: Wer kontrolliert die ungeraden Zeilen? Bleibe geduldig und vermeide Vorlagen.`
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
