/**
 * KI-Engine für Vier Gewinnt Deluxe
 * Basiert auf dem Minimax-Algorithmus mit Alpha-Beta-Pruning
 * und heuristischer Stellungsbewertung.
 */

class ConnectFourAI {
  constructor() {
    this.nodesEvaluated = 0;
    this.startTime = 0;
    // Zug-Reihenfolge: Das Zentrum (Spalte 3) hat die meisten 4er-Kombinationen,
    // daher wird es zuerst geprüft, was den Alpha-Beta-Schnitt extrem beschleunigt.
    this.columnOrder = [3, 2, 4, 1, 5, 0, 6];
  }

  /**
   * Berechnet den besten Zug für die aktuelle Spielsituation
   * @param {Array<Array<number>>} board 6x7 Matrix
   * @param {number} difficulty 1 = Anfänger, 2 = Fortgeschritten, 3 = Taktiker, 4 = Meister
   * @param {boolean} popOutActive Ist die Pop-Out Zusatzregel aktiv?
   * @returns {Object} { action: 'drop'|'pop', column: number, nodes: number, timeMs: number }
   */
  getBestMove(board, difficulty, popOutActive = false) {
    this.nodesEvaluated = 0;
    this.startTime = performance.now();

    const aiPlayer = 2;
    const humanPlayer = 1;

    // Stufe 1: Gelegentlicher Zufall für menschliches Anfänger-Verhalten
    if (difficulty === 1) {
      if (Math.random() < 0.35) {
        const validDrops = this.getValidDropColumns(board);
        if (validDrops.length > 0) {
          const randomCol = validDrops[Math.floor(Math.random() * validDrops.length)];
          return {
            action: 'drop',
            column: randomCol,
            nodes: 1,
            timeMs: Math.round(performance.now() - this.startTime)
          };
        }
      }
    }

    // Rechentiefen pro Stufe
    let depth = 3;
    if (difficulty === 1) depth = 1;
    else if (difficulty === 2) depth = 3;
    else if (difficulty === 3) depth = 5;
    else if (difficulty === 4) {
      // Wenn das Brett voller wird, kann die KI noch tiefer blicken
      const emptyCells = this.countEmptyCells(board);
      depth = emptyCells <= 14 ? 8 : 7;
    }

    // Minimax-Suche starten
    const result = this.minimax(
      board,
      depth,
      -Infinity,
      Infinity,
      true,
      aiPlayer,
      humanPlayer,
      popOutActive
    );

    const timeMs = Math.round(performance.now() - this.startTime);

    // Fallback: Falls Minimax keinen Zug fand, nimm den ersten legalen Drop
    if (result.move === null) {
      const validDrops = this.getValidDropColumns(board);
      return {
        action: 'drop',
        column: validDrops[0] ?? 3,
        nodes: this.nodesEvaluated,
        timeMs
      };
    }

    return {
      action: result.move.action,
      column: result.move.col,
      nodes: this.nodesEvaluated,
      timeMs
    };
  }

  /**
   * Minimax mit Alpha-Beta-Pruning
   */
  minimax(board, depth, alpha, beta, isMaximizing, aiPlayer, humanPlayer, popOutActive) {
    this.nodesEvaluated++;

    // Abbruchbedingungen prüfen
    const winner = this.checkWin(board);
    if (winner === aiPlayer) return { score: 100000 + depth * 100, move: null };
    if (winner === humanPlayer) return { score: -100000 - depth * 100, move: null };
    if (this.isBoardFull(board) || depth === 0) {
      return { score: this.evaluateBoard(board, aiPlayer, humanPlayer), move: null };
    }

    // Alle möglichen Züge sammeln (Drops und optional Pop-Outs)
    const possibleMoves = [];
    const validDrops = this.getValidDropColumns(board);

    // Drop-Züge nach Spalten-Priorität sortieren
    for (const col of this.columnOrder) {
      if (validDrops.includes(col)) {
        possibleMoves.push({ action: 'drop', col });
      }
    }

    // Pop-Out Züge (falls aktiv)
    if (popOutActive) {
      const activePlayer = isMaximizing ? aiPlayer : humanPlayer;
      for (const col of this.columnOrder) {
        if (this.canPopOut(board, col, activePlayer)) {
          possibleMoves.push({ action: 'pop', col });
        }
      }
    }

    if (possibleMoves.length === 0) {
      return { score: 0, move: null }; // Unentschieden
    }

    let bestMove = possibleMoves[0];

    if (isMaximizing) {
      let maxScore = -Infinity;

      for (const move of possibleMoves) {
        const nextBoard = this.applyMove(board, move, aiPlayer);
        const evaluation = this.minimax(
          nextBoard,
          depth - 1,
          alpha,
          beta,
          false,
          aiPlayer,
          humanPlayer,
          popOutActive
        );

        if (evaluation.score > maxScore) {
          maxScore = evaluation.score;
          bestMove = move;
        }

        alpha = Math.max(alpha, evaluation.score);
        if (beta <= alpha) {
          // Alpha-Beta-Schnitt (Pruning): Restliche Züge müssen nicht geprüft werden!
          break;
        }
      }

      return { score: maxScore, move: bestMove };
    } else {
      let minScore = Infinity;

      for (const move of possibleMoves) {
        const nextBoard = this.applyMove(board, move, humanPlayer);
        const evaluation = this.minimax(
          nextBoard,
          depth - 1,
          alpha,
          beta,
          true,
          aiPlayer,
          humanPlayer,
          popOutActive
        );

        if (evaluation.score < minScore) {
          minScore = evaluation.score;
          bestMove = move;
        }

        beta = Math.min(beta, evaluation.score);
        if (beta <= alpha) {
          // Alpha-Beta-Schnitt (Pruning)
          break;
        }
      }

      return { score: minScore, move: bestMove };
    }
  }

  /**
   * Heuristische Stellungsbewertung für ein nicht-terminales Brett
   */
  evaluateBoard(board, aiPlayer, humanPlayer) {
    let score = 0;

    // 1. Zentrumskontrolle belohnen
    // Die mittlere Spalte (Index 3) bietet die meisten 4er-Chancen im gesamten Spiel.
    for (let row = 0; row < 6; row++) {
      if (board[row][3] === aiPlayer) score += 6;
      else if (board[row][3] === humanPlayer) score -= 6;

      // Spalten 2 und 4 ebenfalls leicht bevorzugen
      if (board[row][2] === aiPlayer) score += 3;
      else if (board[row][2] === humanPlayer) score -= 3;
      if (board[row][4] === aiPlayer) score += 3;
      else if (board[row][4] === humanPlayer) score -= 3;
    }

    // 2. Alle 4er-Fenster analysieren (Horizontal, Vertikal, Diagonal)
    // Horizontal
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        score += this.evaluateWindow([board[r][c], board[r][c+1], board[r][c+2], board[r][c+3]], aiPlayer, humanPlayer);
      }
    }

    // Vertikal
    for (let c = 0; c < 7; c++) {
      for (let r = 0; r < 3; r++) {
        score += this.evaluateWindow([board[r][c], board[r+1][c], board[r+2][c], board[r+3][c]], aiPlayer, humanPlayer);
      }
    }

    // Diagonal ansteigend (/)
    for (let r = 3; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        score += this.evaluateWindow([board[r][c], board[r-1][c+1], board[r-2][c+2], board[r-3][c+3]], aiPlayer, humanPlayer);
      }
    }

    // Diagonal abfallend (\)
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        score += this.evaluateWindow([board[r][c], board[r+1][c+1], board[r+2][c+2], board[r+3][c+3]], aiPlayer, humanPlayer);
      }
    }

    return score;
  }

  /**
   * Bewertet ein konkretes 4er-Fenster
   */
  evaluateWindow(window, aiPlayer, humanPlayer) {
    let score = 0;
    const aiCount = window.filter(cell => cell === aiPlayer).length;
    const humanCount = window.filter(cell => cell === humanPlayer).length;
    const emptyCount = window.filter(cell => cell === 0).length;
    const obstacleCount = window.filter(cell => cell === -1).length;

    // Wenn ein Hindernis im Fenster liegt, kann niemand hier gewinnen
    if (obstacleCount > 0) return 0;

    if (aiCount === 4) {
      score += 10000;
    } else if (aiCount === 3 && emptyCount === 1) {
      score += 50;
    } else if (aiCount === 2 && emptyCount === 2) {
      score += 10;
    }

    // Gegnergewinne mit noch höherem Gewicht verhindern (Verteidigung)
    if (humanCount === 3 && emptyCount === 1) {
      score -= 85;
    } else if (humanCount === 2 && emptyCount === 2) {
      score -= 12;
    }

    return score;
  }

  /**
   * Berechnet die Zeile, in die ein Stein in Spalte col fällt
   * Berücksichtigt auch Schwerkraft und feste Hindernisse
   */
  getDropRow(board, col) {
    if (board[0][col] !== 0) return -1; // Spalte oben blockiert

    let dropRow = 0;
    for (let r = 0; r < 5; r++) {
      if (board[r + 1][col] === 0) {
        dropRow = r + 1;
      } else {
        break; // Stein oder Hindernis darunter
      }
    }
    return dropRow;
  }

  /**
   * Führt einen Zug auf einer Kopie des Spielfelds aus
   */
  applyMove(board, move, player) {
    const newBoard = board.map(row => [...row]);

    if (move.action === 'drop') {
      const col = move.col;
      const targetRow = this.getDropRow(newBoard, col);
      if (targetRow !== -1) {
        newBoard[targetRow][col] = player;
      }
    } else if (move.action === 'pop') {
      const col = move.col;
      // Untersten Stein entfernen und alle oberen nach unten rutschen lassen
      for (let r = 5; r > 0; r--) {
        newBoard[r][col] = newBoard[r-1][col];
      }
      newBoard[0][col] = 0;
    }

    return newBoard;
  }

  /**
   * Prüft, ob ein Pop-Out in einer Spalte legal ist (unterster Stein gehört dem Spieler)
   */
  canPopOut(board, col, player) {
    return board[5][col] === player;
  }

  /**
   * Gibt alle Spalten zurück, in denen noch Platz ist
   */
  getValidDropColumns(board) {
    const valid = [];
    for (let c = 0; c < 7; c++) {
      if (board[0][c] === 0) {
        valid.push(c);
      }
    }
    return valid;
  }

  /**
   * Zählt die verbleibenden leeren Zellen auf dem Brett
   */
  countEmptyCells(board) {
    let count = 0;
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 7; c++) {
        if (board[r][c] === 0) count++;
      }
    }
    return count;
  }

  /**
   * Prüft, ob das Brett komplett voll ist
   */
  isBoardFull(board) {
    for (let c = 0; c < 7; c++) {
      if (board[0][c] === 0) return false;
    }
    return true;
  }

  /**
   * Prüft auf einen Gewinn (4 in einer Reihe)
   * @returns {number|null} 1, 2 oder null
   */
  checkWin(board) {
    // Horizontal
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        const val = board[r][c];
        if (val > 0 && val === board[r][c+1] && val === board[r][c+2] && val === board[r][c+3]) {
          return val;
        }
      }
    }

    // Vertikal
    for (let c = 0; c < 7; c++) {
      for (let r = 0; r < 3; r++) {
        const val = board[r][c];
        if (val > 0 && val === board[r+1][c] && val === board[r+2][c] && val === board[r+3][c]) {
          return val;
        }
      }
    }

    // Diagonal (/)
    for (let r = 3; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        const val = board[r][c];
        if (val > 0 && val === board[r-1][c+1] && val === board[r-2][c+2] && val === board[r-3][c+3]) {
          return val;
        }
      }
    }

    // Diagonal (\)
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        const val = board[r][c];
        if (val > 0 && val === board[r+1][c+1] && val === board[r+2][c+2] && val === board[r+3][c+3]) {
          return val;
        }
      }
    }

    return null;
  }

  /**
   * Findet die genauen Koordinaten der 4 Gewinnsteine zum optischen Hervorheben
   */
  findWinningLine(board) {
    // Horizontal
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        const val = board[r][c];
        if (val > 0 && val === board[r][c+1] && val === board[r][c+2] && val === board[r][c+3]) {
          return [[r, c], [r, c+1], [r, c+2], [r, c+3]];
        }
      }
    }

    // Vertikal
    for (let c = 0; c < 7; c++) {
      for (let r = 0; r < 3; r++) {
        const val = board[r][c];
        if (val > 0 && val === board[r+1][c] && val === board[r+2][c] && val === board[r+3][c]) {
          return [[r, c], [r+1, c], [r+2, c], [r+3, c]];
        }
      }
    }

    // Diagonal (/)
    for (let r = 3; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        const val = board[r][c];
        if (val > 0 && val === board[r-1][c+1] && val === board[r-2][c+2] && val === board[r-3][c+3]) {
          return [[r, c], [r-1, c+1], [r-2, c+2], [r-3, c+3]];
        }
      }
    }

    // Diagonal (\)
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        const val = board[r][c];
        if (val > 0 && val === board[r+1][c+1] && val === board[r+2][c+2] && val === board[r+3][c+3]) {
          return [[r, c], [r+1, c+1], [r+2, c+2], [r+3, c+3]];
        }
      }
    }

    return null;
  }
}
