/**
 * Vier Gewinnt Deluxe — Zweisprachiges i18n Modul (Deutsch / Französisch)
 * Default-Sprache: Deutsch ('de')
 */
(function(window) {
  'use strict';

  const translations = {
    de: {
      // Header
      appTitle: 'Vier Gewinnt Deluxe',
      appSubtitle: 'mit KI & Bonus-Herausforderung',
      learnModeLabel: 'Lernmodus:',
      learnModeOn: 'AN',
      learnModeOff: 'AUS',
      learnModeToggleTitle: 'Lernmodus mit KI-Tutor aktivieren/deaktivieren (Taste L)',
      learnModeBtnOn: '🎓 Lernmodus: AN',
      learnModeBtnOff: '🎓 Lernmodus: AUS',
      toggleSound: 'Sound umschalten',
      rulesBtn: '📖 Regeln',

      // Mode & Language
      modeTitle: 'Spielmodus',
      mode1p: '1 Spieler',
      mode1pSub: 'Gegen die KI',
      mode1pTooltip: '1 Spieler gegen die KI',
      mode2p: '2 Spieler',
      mode2pSub: 'Lokal am PC',
      mode2pTooltip: '2 Spieler lokal am PC',
      langTitle: 'Sprache / Langue',

      // AI Settings
      aiTitle: 'KI-Spielstärke',
      diff1Badge: 'Stufe 1',
      diff1Name: 'Anfänger',
      diff1Title: 'Suchtiefe 1: Macht Fehler, ideal für Anfänger',
      diff2Badge: 'Stufe 2',
      diff2Name: 'Fortgeschritten',
      diff2Title: 'Suchtiefe 3: Solide Grundtaktik & Zentrumskontrolle',
      diff3Badge: 'Stufe 3',
      diff3Name: 'Taktiker',
      diff3Title: 'Suchtiefe 5: Blickt voraus und stellt Fallen',
      diff4Badge: 'Stufe 4',
      diff4Name: 'Meister',
      diff4Title: 'Suchtiefe 7+: Nahezu unbesiegbar mit Minimax',
      aiThinking: 'KI berechnet Zug...',

      // Bonus Rules
      bonusTag: 'BONUS',
      bonusTitle: 'Zusatzregeln',
      bonusNo: 'Nein',
      bonusYes: 'Ja',
      popoutTitle: 'Pop-Out Regel',
      popoutDesc: 'Untersten eigenen Stein herausziehen',
      popoutTooltip: 'Jeder Spieler darf im eigenen Zug seinen untersten Stein herausziehen. Alle Steine darüber rutschen nach!',
      obstaclesTitle: 'Sperrfelder',
      obstaclesDesc: '2 blockierte Hindernisfelder',
      obstaclesTooltip: '2 zufällige Felder sind blockiert und können nicht bespielt werden!',

      // Actions
      newGameBtn: '🔄 Neues Spiel',
      undoBtn: '↩ Zurück',
      undoTooltip: 'Einen Stein zurücknehmen (Taste U oder Strg+Z)',
      redoBtn: 'Vor ↪',
      redoTooltip: 'Einen Stein vorwärtsgehen (Taste V oder Strg+Y)',
      replayModeLive: '▶ Spielverlauf',
      replayModeReplay: '⏮️ Zug-Wiederholung',
      replayMove: 'Zug {n}',
      replayMoveOf: 'Zug {n} von {total}',
      showBestBtn: 'Besten Zug anzeigen',
      hideBestBtn: 'Vorschau ausblenden',
      prepositionIn: 'in',
      actionDrop: '▼ Einwurf',
      closeBtnAria: 'Schließen',
      bestBtnTitle: 'Zeigt den besten Zug für {player} auf dem Brett (Taste B)',
      bestRecommendationTag: '💡 Empfehlung',
      bestColTarget: 'Spalte {col}',
      bestMoveFor: 'Bester Zug für {player}',
      bestHintTag: 'BESTER ZUG',
      bestColBadge: '💡 Bester Zug',
      bestNote: 'ℹ️ Nur visuelle Vorschau — Zug wird nicht ausgeführt',
      noMovePossible: 'Kein Zug möglich',
      noMoveDesc: 'Das Spielfeld bietet keine freien Züge mehr.',

      // Board & Turn Bar
      turnBarCaption: 'Am Zug:',
      turnBarCaptionReplay: 'Wiederholung am Zug:',
      turnBarCaptionAi: 'KI am Zug:',
      turnBarCaptionWinner: '🏆 Sieger:',
      turnBarCaptionAiWinner: '🤖 Sieger:',
      turnBarCaptionDraw: '🤝 Remis',
      colorRed: 'Rot',
      colorRedP1: 'Rot (Spieler 1)',
      colorYellowComputer: 'Gelb (Computer)',
      colorYellowThinking: 'Gelb (überlegt...)',
      colorYellowP2: 'Gelb (Spieler 2)',
      manualAiBtn: '🤖 KI ziehen lassen',
      manualAiBtnTitle: 'KI den nächsten Zug berechnen und ausführen lassen',

      // Pop-Out Bar
      popoutBarLabel: 'Pop-Out (Stein unten entfernen):',
      popoutColBtnTitle: 'Spalte {col} Pop-Out',

      // Replay Ribbon
      ribbonTag: '⏮️ WIEDERHOLUNG',
      ribbonStepOf: 'Zug {current} von {total}',
      ribbonNextTurn: 'Nächster Zug:',
      ribbonRedTurn: 'Rot ist als Nächstes dran',
      ribbonYellowTurn: 'Gelb ist als Nächstes dran',
      ribbonBestBtn: '💡 Bester Zug',
      ribbonBestBtnTitle: 'Besten Zug auf dem Brett anzeigen (Taste B)',

      // Game Over Banner
      winnerRedTitle: 'Rot hat gewonnen!',
      winnerAiTitle: 'Die KI (Gelb) hat gewonnen!',
      winnerYellowTitle: 'Gelb hat gewonnen!',
      winnerDrawTitle: 'Unentschieden!',
      winnerTag: 'Partie beendet',
      winnerSubRed: 'Hervorragend gespielt! Schau dir das Spielfeld in Ruhe an.',
      winnerSubAi: 'Die KI war diesmal einen Schritt voraus. Gleich nochmal probieren!',
      winnerSubYellow: 'Glückwunsch! Gelb hat diese Partie für sich entschieden.',
      winnerSubDraw: 'Keine Züge mehr möglich — ein spannendes Remis!',
      playAgainBtn: '🔄 Neues Spiel',

      // Match Stats
      statsTitle: 'Match-Statistik',
      statP1Wins: 'Siege Rot:',
      statP2WinsComputer: 'Siege Gelb (Computer):',
      statP2WinsP2: 'Siege Gelb (Spieler 2):',
      statRounds: 'Gespielte Runden:',
      statDraws: 'Unentschieden:',
      statMoves: 'Züge in dieser Runde:',

      // KI Insight
      algoTitle: 'KI-Einblick',
      algoLabel: 'Algorithmus:',
      algoName: 'Minimax + αβ-Pruning',
      algoDepthLabel: 'Aktuelle Rechentiefe:',
      algoMovesSuffix: 'Züge',
      algoNodesLabel: 'Geprüfte Stellungen:',
      algoTimeLabel: 'Berechnungszeit:',
      algoDesc: 'Die KI analysiert alle möglichen Folgezüge, schneidet schlechte Äste mit α-β-Schnitten sofort ab und bewertet Zentrumskontrolle und Drohungen.',

      // Tutor & Coach
      tutorCoachTitle: 'Prof. Vier',
      tutorCoachHeader: 'KI-Tutor Prof. Vier',
      tutorCoachRole: 'Taktik- & Strategie-Coach',
      tutorLivePulseTitle: 'Tutor analysiert das Spielfeld in Echtzeit',
      coachMoodTitle: 'Taktische Lage',
      coachWelcomeText: 'Willkommen! Ich analysiere das Spiel live. Fahre mit der Maus über die Spalten oder sieh dir meine Tipps an.',
      tutorQuickBadge: 'Tutor-Coach:',
      tutorQuickWelcome: 'Fahre mit der Maus über die Spalten oder wähle einen Zug, um die Analyse zu sehen.',
      tutorTeaserTitle: 'KI-Lernmodus',
      tutorTeaserDesc: 'Lerne Meisterstrategien, Vorlagen-Vermeidung & Gabeln mit Live-Coach Prof. Vier!',
      tutorActivateBtn: '🎓 Lernmodus aktivieren',
      recommendedMoveLabel: 'Empfohlener Zug:',
      topRecommendationBadge: 'Top-Empfehlung',
      colAnalysisLabel: 'Spalten-Analyse (Fahre mit Maus drüber):',
      academySectionLabel: '🎯 Akademie & Strategie-Zentrum',
      strategyTipDefault: 'Die Spalte 4 in der Mitte ist das Herzstück des Spiels. Wer das Zentrum beherrscht, diktiert das Geschehen!',
      btnOpenOpenings: '🌟 Eröffnungsvarianten (Grafik)',
      btnOpenOpeningsTitle: 'Wichtigste Varianten der ersten Züge in Grafik ansehen',
      btnOpenBlunders: '⚠️ Häufigste gravierende Fehler',
      btnOpenBlundersTitle: 'Häufigste gravierende Fehler mit Grafik studieren',
      btnOpenStrategies: '📚 6 Grundstrategien lernen',
      btnOpenStrategiesTitle: 'Die 6 goldenen Grundstrategien lernen',
      bestCol4Default: 'Spalte 4',
      bestMoveColDefault: 'Spalte 4',
      bestDescDefault: 'Zentrumskontrolle: Eröffnet die meisten Kombinationen.',
      bestMoveReasonDefault: 'Zentrumskontrolle: Eröffnet die meisten 4er-Kombinationen.',

      // Coach Live Speech Messages
      coachDoubleThreatTitle: 'Doppelbedrohung aktiv!',
      coachDoubleThreatText: 'Der Gegner besitzt eine offene Dreierkette mit ZWEI Gewinnfeldern ({threatCols}). Da du pro Runde nur ein Feld blockieren kannst, gewinnt der Gegner am anderen Ende. Lektion: Solche Ketten müssen immer EINEN ZUG VORHER (Präventiv-Block) gestoppt werden!',
      coachRedAlertTitle: 'Alarmstufe Rot!',
      coachRedAlertText: 'Der Gegner droht mit einem Sofort-Gewinn in {col}! Du musst dieses Feld jetzt unbedingt mit der Pflicht-Rettung blockieren!',
      coachPreventForkTitle: 'Vorausblick: Gabel verhindern!',
      coachPreventForkText: 'Achtung: Der Gegner bereitet eine offene Dreierkette / Gabel in {forkCols} vor! Wenn du nicht jetzt präventiv blockst, droht im übernächsten Zug die unaufhaltbare Niederlage.',
      coachWinReadyTitle: 'Siegzug bereit!',
      coachWinReadyText: 'Du hast das Spiel in der Hand! Setze in {col}, um deine Viererkette zu vollenden und zu gewinnen.',
      coachForkTitle: 'Taktische Zwickmühle!',
      coachForkText: 'Nutze {col}! Damit stellst du eine unlösbare Doppelbedrohung (Gabel) auf. Der Gegner kann nicht beide Wege verteidigen.',
      coachOpeningTitle: 'Eröffnungsphase: Die ersten Züge',
      coachOpeningText: 'In den ersten Zügen gilt: Spalte 4 (Zentrum) ist mathematisch die stärkste Eröffnung (16 Linien)! Klicke rechts auf "🌟 Eröffnungsvarianten", um die 4 Schlüssel-Muster in Grafiken zu studieren.',
      coachMidgameTitle: 'Mittelspiel: Vorlagen meiden',
      coachMidgameText: 'Baue eigene Reihen auf, aber prüfe immer: Kann der Gegner auf deinen Stein draufsetzen? Empfehlung: {rec}.',
      coachEndgameTitle: 'Endspiel: Präzision zählt!',
      coachEndgameText: 'Das Brett füllt sich. Berechne jeden Zug voraus: Wer kontrolliert die ungeraden Zeilen? Bleibe geduldig und vermeide Vorlagen.',
      coachGameOverRed: 'Glückwunsch! Deine 4er-Reihe leuchtet auf dem Spielfeld. Schau dir die Stellung in Ruhe an und klicke auf "Neues Spiel", sobald du bereit bist.',
      coachGameOverYellow: '{name} hat 4 Steine in eine Reihe gebracht (siehe leuchtende Steine). Untersuche in Ruhe auf dem Brett, wo der entscheidende Zug lag!',
      coachGameOverDraw: 'Unentschieden! Das Spielfeld ist komplett besetzt. Klicke auf "Neues Spiel" für die nächste Runde.',
      coachThinkingTitle: 'KI rechnet...',
      coachThinkingText: 'Die KI überlegt ihren Zug. Beobachte aufmerksam, wie sie auf Bedrohungen reagiert und das Zentrum nutzt!',

      // Quickbar Messages
      tutorRecommendation: 'Tutor-Empfehlung',
      tutorPlayCol: 'Spiele <strong>{col}</strong>',
      colFullMsg: '{col} ist voll!',
      chooseFreeCol: 'Wähle bitte eine freie Spalte.',
      dangerOppWinIn: 'GEGNER-SIEG IN {col}',
      dangerOppForkIn: 'DROHENDE GEGNER-GABEL IN {col}',
      dangerOppWin: 'GEGNER-SIEG',
      centerColName: 'Mitte',
      colorYellow: 'Gelb',
      tutorQuickAiThinking: 'Gleich bist du wieder dran!',
      tutorQuickWinRedTitle: 'Sieg für Rot!',
      tutorQuickWinRedDesc: 'Die 4er-Reihe leuchtet auf dem Brett. Schau dir das Spielfeld in Ruhe an.',
      tutorQuickWinYellowTitle: '{name} hat gewonnen!',
      tutorQuickWinYellowDesc: 'Die 4er-Reihe leuchtet auf dem Spielfeld — analysiere die Stellung in Ruhe.',

      // Tutor Tactical Evaluation
      tacticalInvalid: 'Ungültiger Zug.',
      tacticalColFull: 'In diese Spalte passt kein Stein mehr hinein.',
      tacticalWin: 'Sofortiger Spielgewinn (100% — Bester Zug).',
      tacticalWinExplanation: 'Mit diesem Einwurf vollendest du sofort deine 4er-Kette auf Zeile {row} und gewinnst das Spiel!',
      tacticalFatalBlunder: 'Tödlicher Fehler (0%): Baut dem Gegner die Vorlage für den Sofort-Sieg.',
      tacticalFatalLoss: 'Führt zur sofortigen Niederlage (0%): Lässt den gegnerischen Siegzug in {threatCol} ungehindert zu.',
      tacticalForcedDefense: 'Erfolgreiche Pflicht-Verteidigung (95%): Wehrt die drohende Niederlage ab.',
      tacticalPreventFork: 'Vorausschauende Rettung (88%): Verhindert eine unlösbare gegnerische Gabel im übernächsten Zug.',
      tacticalAllowFork: 'Führt zur Niederlage in 2 Zügen (15%): Erlaubt dem Gegner eine unaufhaltbare Doppelbedrohung in {forkCol}.',
      tacticalCreateFork: 'Unlösbare Zwickmühle (90%): Erzeugt zwei gleichzeitige Siegchancen.',
      tacticalAttackBuild: 'Aggressiver Angriffsaufbau (82%): Hohe Durchschlagskraft.',
      tacticalCenterControl: 'Dominante Zentrumskontrolle (75%): Maximale Kombinationsvielfalt.',
      tacticalSolidPosition: 'Solider Stellungsaufbau (65%): Sichere Positionsverbesserung.',
      tacticalPassiveFlank: 'Passiver Flankenzug (50%).',
      tacticalUnfavorable: 'Taktisch ungünstige Feldwahl (38%).',
      tacticalEdgeMove: 'Wenig dynamischer Randzug (28%): Geringes strategisches Potenzial.',
      tacticalPopoutWin: 'Überraschender Kettenreaktions-Sieg durch Pop-Out (100%).',
      tacticalPopoutBlunder: 'Tödliche Kettenreaktion (0%): Schenkt dem Gegner sofort den Sieg.',
      tacticalPopoutChange: 'Verändert die Spaltenhöhen und bricht eventuell Linien auf.',
      tacticalCenterHeadline: 'Zentrumskontrolle in {col}',
      tacticalCenterDesc: 'Die Mitte ist das Herzstück des Spiels. Von Spalte 4 kreuzen 16 mögliche 4er-Ketten in alle Richtungen – das ist das maximale Angriffspotenzial.',
      tacticalCenterQuality: 'Sehr gut (Zentrum)',
      tacticalCenterGrade: '75% — Sehr gut',
      tacticalSolidHeadline: 'Solider Stellungsaufbau in {col}',
      tacticalSolidDesc: 'Guter Aufbauzug: Verbessert deine Stellung und hält viele Optionen offen.',
      tacticalSolidQuality: 'Solider Aufbau',
      tacticalSolidGrade: '65% — Solide',
      tacticalEdgeHeadline: 'Flanken- / Randzug in {col}',
      tacticalEdgeDesc: 'Randsteine bieten weniger Angriffschancen. Das Zentrum ist meist wertvoller.',
      tacticalEdgeQuality: 'Passiver Randzug',
      tacticalEdgeGrade: '28% — Randzug',
      tacticalMustBlockHeadline: 'Lebenswichtige Rettung in {col}!',
      tacticalMustBlockDesc: 'Dieser Zug ist deine einzige Rettung! Der Gegner hatte hier bereits 3 Steine in einer Reihe.',
      tacticalMustBlockQuality: 'Pflicht-Rettung (Bester Zug)',
      tacticalMustBlockGrade: '95% — Pflicht-Rettung',
      tacticalWinHeadline: 'Sofortiger Sieg in {col}!',
      tacticalWinQuality: 'Sofortiger Sieg (100%)',
      tacticalWinGrade: '100% — Siegzug',
      tacticalBlunderHeadline: 'Tödliche Vorlage in {col}!',
      tacticalBlunderDesc: 'Vorsicht Vorlage: Wenn du hier spielst, setzt der Gegner direkt darauf und gewinnt sofort!',
      tacticalBlunderQuality: 'Tödliche Vorlage (0%)',
      tacticalBlunderGrade: '0% — Tödlicher Fehler',
      tacticalForkHeadline: 'Doppelbedrohung (Gabel) in {col}!',
      tacticalForkDesc: 'Genialer Taktikzug! Dieser Stein eröffnet zwei getrennte Gewinnfelder gleichzeitig. Der Gegner kann nur eines blockieren – dein Sieg ist unausweichlich!',
      tacticalForkQuality: 'Hervorragend (Gabel)',
      tacticalForkGrade: '90% — Hervorragend',
      tacticalAttackHeadline: 'Offene Dreierkette in {col}!',
      tacticalAttackDesc: 'Du baust eine Dreierkette mit freien Enden auf. Das setzt den Gegner massiv unter Druck und erzwingt Verteidigungszüge.',
      tacticalAttackQuality: 'Sehr stark (Offene 3er)',
      tacticalAttackGrade: '82% — Sehr stark',
      tacticalColFullHeadline: '{col} ist voll',
      tacticalFatalIgnoreHeadline: 'Tödlicher Fehler: Gegner gewinnt in {threatCol}!',
      tacticalFatalIgnoreDesc: 'Wenn du in {col} spielst, blockst du nicht die gegnerische 4er-Kette in {threatCol}! Der Gegner setzt im nächsten Zug dort ein und gewinnt sofort das Spiel.',
      tacticalFatalLossQuality: 'Tödlicher Fehler (0%)',
      tacticalFatalLossGrade: '0% — Niederlage',
      tacticalPreemptiveHeadline: 'Präventiv-Block in {col}!',
      tacticalPreemptiveDesc: 'Vorausschauende Meister-Verteidigung! Wenn du hier nicht blockst, baut der Gegner im nächsten Zug eine offene Dreierkette mit zwei freien Enden. Dein Zug erstickt diese tödliche Doppelbedrohung rechtzeitig im Keim!',
      tacticalPreemptiveQuality: 'Präventiv-Block (Top)',
      tacticalPreemptiveGrade: '88% — Präventiv-Block',
      tacticalAllowForkHeadline: 'Gefahr im übernächsten Zug: Gegner-Gabel droht!',
      tacticalAllowForkDesc: 'Achtung Vorausblick: Wenn du in {col} spielst, kann der Gegner im Gegenzug in {forkCol} eine offene Dreierkette / Gabel legen! Danach hat der Gegner ZWEI Gewinnfelder gleichzeitig ({winCols}), und du verlierst unweigerlich.',
      tacticalAllowForkQuality: 'Gegner-Gabel droht (15%)',
      tacticalAllowForkGrade: '15% — Verliert in 2 Zügen',
      tacticalFlankPassableHeadline: 'Passabler Flankenzug in {col}',
      tacticalFlankRiskyHeadline: 'Riskante Position in {col}',
      tacticalFlankPassableDesc: 'Flankenposition mit mäßigem Einfluss auf das Zentrum (7 mögliche Ketten).',
      tacticalFlankRiskyDesc: 'Dieser Zug bringt dir wenig Raumgewinn und könnte deine Stellung langfristig schwächen.',
      tacticalFlankPassableGrade: '50% — Passabel',
      tacticalFlankRiskyGrade: '38% — Riskant',
      tacticalFlankPassableQuality: 'Passabel (Mäßig)',
      tacticalFlankRiskyQuality: 'Riskant (Schwach)',
      badgeFull: 'Voll',
      badgePopWin: '👑 Pop-Sieg',
      badgePopOut: '▲ Pop-Out',
      ratingNotPossible: '0% — Nicht möglich',
      ratingLoss: '0% — Niederlage',
      colIsFullQuality: 'Spalte voll',
      popWinQuality: 'Pop-Siegzug',
      popBlunderQuality: 'Fataler Pop-Out',
      popWinHeadline: 'Gewinnbringender Pop-Out in {col}!',
      popWinDesc: 'Wenn du den untersten Stein herausziehst, fallen deine oberen Steine genau zu einer 4er-Reihe zusammen!',
      popBlunderHeadline: 'Fataler Pop-Out in {col}!',
      popBlunderDesc: 'Vorsicht! Wenn du diesen Stein entfernst, gewinnt der Gegner durch nachrutschende Steine sofort!',
      popNeutralHeadline: 'Pop-Out in {col}',
      popNeutralQuality: 'Pop-Out',
      popNeutralGrade: '50% — Neutral',

      // Modals
      rulesModalHeading: 'Vier Gewinnt Deluxe — Spielregeln',
      rulesModalCloseBtn: 'Verstanden & Loslegen',
      academyModalTitle: 'Vier-Gewinnt Taktik- & Strategie-Zentrum',
      tabOpenings: '🌟 Eröffnungsvarianten (Erste Züge)',
      tabBlunders: '⚠️ Häufigste gravierende Fehler',
      tabStrategies: '📚 6 Grundstrategien'
    },

    fr: {
      // Header
      appTitle: 'Puissance 4 Deluxe',
      appSubtitle: 'avec IA & Défis Bonus',
      learnModeLabel: 'Mode Tuteur :',
      learnModeOn: 'OUI',
      learnModeOff: 'NON',
      learnModeToggleTitle: 'Activer/Désactiver le mode tuteur (Touche L)',
      learnModeBtnOn: '🎓 Mode Tuteur : ACTIVÉ',
      learnModeBtnOff: '🎓 Mode Tuteur : DÉSACTIVÉ',
      toggleSound: 'Activer/Désactiver le son',
      rulesBtn: '📖 Règles',

      // Mode & Language
      modeTitle: 'Mode de jeu',
      mode1p: '1 Joueur',
      mode1pSub: 'Contre l\'IA',
      mode1pTooltip: '1 Joueur contre l\'IA',
      mode2p: '2 Joueurs',
      mode2pSub: 'En local',
      mode2pTooltip: '2 Joueurs en local sur le PC',
      langTitle: 'Langue / Sprache',

      // AI Settings
      aiTitle: 'Niveau de l\'IA',
      diff1Badge: 'Niveau 1',
      diff1Name: 'Débutant',
      diff1Title: 'Profondeur 1 : Fait des erreurs, idéal pour débuter',
      diff2Badge: 'Niveau 2',
      diff2Name: 'Intermédiaire',
      diff2Title: 'Profondeur 3 : Tactique solide & contrôle du centre',
      diff3Badge: 'Niveau 3',
      diff3Name: 'Tacticien',
      diff3Title: 'Profondeur 5 : Anticipe et tend des pièges',
      diff4Badge: 'Niveau 4',
      diff4Name: 'Maître',
      diff4Title: 'Profondeur 7+ : Quasi invincible avec Minimax',
      aiThinking: 'L\'IA calcule son coup...',

      // Bonus Rules
      bonusTag: 'BONUS',
      bonusTitle: 'Règles Spéciales',
      bonusNo: 'Non',
      bonusYes: 'Oui',
      popoutTitle: 'Règle Pop-Out',
      popoutDesc: 'Retirer son jeton du bas',
      popoutTooltip: 'À son tour, chaque joueur peut retirer son propre jeton du bas. Les jetons au-dessus glissent vers le bas !',
      obstaclesTitle: 'Cases bloquées',
      obstaclesDesc: '2 cases obstacles bloquées',
      obstaclesTooltip: '2 cases choisies au hasard sont bloquées et injouables !',

      // Actions
      newGameBtn: '🔄 Nouvelle Partie',
      undoBtn: '↩ Annuler',
      undoTooltip: 'Annuler un coup (Touche U ou Ctrl+Z)',
      redoBtn: 'Rétablir ↪',
      redoTooltip: 'Rétablir un coup (Touche V ou Ctrl+Y)',
      replayModeLive: '▶ Déroulement',
      replayModeReplay: '⏮️ Relecture des coups',
      replayMove: 'Coup {n}',
      replayMoveOf: 'Coup {n} sur {total}',
      showBestBtn: 'Afficher le meilleur coup',
      hideBestBtn: 'Masquer la suggestion',
      prepositionIn: 'en',
      actionDrop: '▼ Coup',
      closeBtnAria: 'Fermer',
      bestBtnTitle: 'Affiche le meilleur coup pour {player} sur le plateau (Touche B)',
      bestRecommendationTag: '💡 Recommandation',
      bestColTarget: 'Colonne {col}',
      bestMoveFor: 'Meilleur coup pour {player}',
      bestHintTag: 'MEILLEUR COUP',
      bestColBadge: '💡 Meilleur coup',
      bestNote: 'ℹ️ Aperçu visuel uniquement — le coup n\'est pas joué',
      noMovePossible: 'Aucun coup possible',
      noMoveDesc: 'Le plateau ne propose plus aucun coup libre.',

      // Board & Turn Bar
      turnBarCaption: 'Au tour de :',
      turnBarCaptionReplay: 'Relecture, au tour de :',
      turnBarCaptionAi: 'L\'IA réfléchit :',
      turnBarCaptionWinner: '🏆 Vainqueur :',
      turnBarCaptionAiWinner: '🤖 Vainqueur :',
      turnBarCaptionDraw: '🤝 Match nul',
      colorRed: 'Rouge',
      colorRedP1: 'Rouge (Joueur 1)',
      colorYellowComputer: 'Jaune (Ordinateur)',
      colorYellowThinking: 'Jaune (réfléchit...)',
      colorYellowP2: 'Jaune (Joueur 2)',
      manualAiBtn: '🤖 Faire jouer l\'IA',
      manualAiBtnTitle: 'Laisser l\'IA calculer et jouer le coup',

      // Pop-Out Bar
      popoutBarLabel: 'Pop-Out (Retirer le jeton du bas) :',
      popoutColBtnTitle: 'Pop-Out Colonne {col}',

      // Replay Ribbon
      ribbonTag: '⏮️ RELECTURE',
      ribbonStepOf: 'Coup {current} sur {total}',
      ribbonNextTurn: 'Prochain coup :',
      ribbonRedTurn: 'Au tour des Rouges',
      ribbonYellowTurn: 'Au tour des Jaunes',
      ribbonBestBtn: '💡 Meilleur coup',
      ribbonBestBtnTitle: 'Afficher le meilleur coup sur le plateau (Touche B)',

      // Game Over Banner
      winnerRedTitle: 'Les Rouges ont gagné !',
      winnerAiTitle: 'L\'IA (Jaune) a gagné !',
      winnerYellowTitle: 'Les Jaunes ont gagné !',
      winnerDrawTitle: 'Match nul !',
      winnerTag: 'Partie terminée',
      winnerSubRed: 'Magnifique partie ! Prenez le temps d\'analyser le plateau.',
      winnerSubAi: 'L\'IA avait un coup d\'avance cette fois. Prenez votre revanche !',
      winnerSubYellow: 'Félicitations ! Les Jaunes remportent cette manche.',
      winnerSubDraw: 'Plus aucun coup possible — un match nul très disputé !',
      playAgainBtn: '🔄 Nouvelle Partie',

      // Match Stats
      statsTitle: 'Statistiques du Match',
      statP1Wins: 'Victoires Rouges :',
      statP2WinsComputer: 'Victoires Jaunes (Ordinateur) :',
      statP2WinsP2: 'Victoires Jaunes (Joueur 2) :',
      statRounds: 'Parties jouées :',
      statDraws: 'Matchs nuls :',
      statMoves: 'Coups cette manche :',

      // KI Insight
      algoTitle: 'Aperçu de l\'IA',
      algoLabel: 'Algorithme :',
      algoName: 'Minimax + Élagage αβ',
      algoDepthLabel: 'Profondeur de calcul :',
      algoMovesSuffix: 'coups',
      algoNodesLabel: 'Positions analysées :',
      algoTimeLabel: 'Temps de calcul :',
      algoDesc: 'L\'IA analyse toutes les suites de coups possibles, coupe immédiatement les branches défavorables par élagage α-β et évalue le contrôle du centre et les menaces.',

      // Tutor & Coach
      tutorCoachTitle: 'Prof. Quatre',
      tutorCoachHeader: 'Tuteur IA Prof. Quatre',
      tutorCoachRole: 'Coach tactique en direct',
      tutorLivePulseTitle: 'Le tuteur analyse le plateau en temps réel',
      coachMoodTitle: 'Situation Tactique',
      coachWelcomeText: 'Bienvenue ! J\'analyse la partie en direct. Survolez les colonnes ou consultez mes conseils tactiques.',
      tutorQuickBadge: 'Coach-Tuteur :',
      tutorQuickWelcome: 'Survolez les colonnes ou choisissez un coup pour afficher l\'analyse.',
      tutorTeaserTitle: 'Mode Tuteur IA',
      tutorTeaserDesc: 'Apprenez les stratégies de maître, l\'évitement des pièges et les fourchettes avec Prof. Quatre !',
      tutorActivateBtn: '🎓 Activer le mode tuteur',
      recommendedMoveLabel: 'Coup recommandé :',
      topRecommendationBadge: 'Meilleur choix',
      colAnalysisLabel: 'Analyse des colonnes (Survolez avec la souris) :',
      academySectionLabel: '🎯 Académie & Stratégies',
      strategyTipDefault: 'La colonne 4 au centre est le cœur du jeu. Qui domine le centre contrôle la partie !',
      btnOpenOpenings: '🌟 Variantes d\'ouverture (Graphiques)',
      btnOpenOpeningsTitle: 'Consulter les variantes des premiers coups avec graphiques',
      btnOpenBlunders: '⚠️ Erreurs majeures fréquentes',
      btnOpenBlundersTitle: 'Étudier les erreurs majeures fréquentes avec graphiques',
      btnOpenStrategies: '📚 Les 6 stratégies d\'or',
      btnOpenStrategiesTitle: 'Apprendre les 6 stratégies fondamentales',
      bestCol4Default: 'Colonne 4',
      bestMoveColDefault: 'Colonne 4',
      bestDescDefault: 'Contrôle du centre : ouvre le plus grand nombre de combinaisons.',
      bestMoveReasonDefault: 'Contrôle du centre : ouvre le plus grand nombre d\'alignements de 4.',

      // Coach Live Speech Messages
      coachDoubleThreatTitle: 'Double menace active !',
      coachDoubleThreatText: 'L\'adversaire possède un alignement de 3 avec DEUX cases gagnantes ({threatCols}). Comme vous ne pouvez bloquer qu\'une seule case, l\'adversaire gagnera sur l\'autre. Leçon : il faut toujours parer un coup avant (parade préventive) !',
      coachRedAlertTitle: 'Alerte Rouge !',
      coachRedAlertText: 'L\'adversaire menace de gagner immédiatement en {col} ! Vous devez impérativement bloquer cette case par une parade obligatoire !',
      coachPreventForkTitle: 'Anticipation : empêcher la fourchette !',
      coachPreventForkText: 'Attention : l\'adversaire prépare un alignement de 3 / fourchette en {forkCols} ! Si vous ne parez pas préventivement, la défaite sera inévitable au coup suivant.',
      coachWinReadyTitle: 'Coup gagnant disponible !',
      coachWinReadyText: 'Vous avez la partie en main ! Jouez en {col} pour compléter votre alignement de 4 et remporter la victoire.',
      coachForkTitle: 'Dilemme tactique imparable !',
      coachForkText: 'Profitez de la {col} ! Vous créez ainsi une double menace (fourchette) imparable. L\'adversaire ne pourra pas parer les deux.',
      coachOpeningTitle: 'Phase d\'ouverture : premiers coups',
      coachOpeningText: 'Dans les premiers coups : la Colonne 4 (centre) est mathématiquement la plus puissante (16 lignes) ! Cliquez à droite sur « 🌟 Variantes d\'ouverture » pour étudier les schémas clés.',
      coachMidgameTitle: 'Milieu de partie : éviter les pièges',
      coachMidgameText: 'Construisez vos alignements, mais vérifiez toujours : l\'adversaire peut-il poser directement dessus ? Recommandation : {rec}.',
      coachEndgameTitle: 'Fin de partie : précision maximale !',
      coachEndgameText: 'Le plateau se remplit. Calculez chaque coup : qui contrôle les lignes impaires ? Restez patient et évitez les offrandes.',
      coachGameOverRed: 'Félicitations ! Votre alignement de 4 brille sur le plateau. Analysez la position et cliquez sur « Nouvelle Partie » quand vous êtes prêt.',
      coachGameOverYellow: '{name} a aligné 4 jetons (voir jetons illuminés). Analysez sur le plateau où s\'est joué le coup décisif !',
      coachGameOverDraw: 'Match nul ! Le plateau est plein. Cliquez sur « Nouvelle Partie » pour la manche suivante.',
      coachThinkingTitle: 'L\'IA calcule...',
      coachThinkingText: 'L\'IA calcule son coup. Observez attentivement sa gestion des menaces et du contrôle central !',

      // Quickbar Messages
      tutorRecommendation: 'Recommandation du tuteur',
      tutorPlayCol: 'Jouez <strong>{col}</strong>',
      colFullMsg: 'La {col} est pleine !',
      chooseFreeCol: 'Veuillez choisir une colonne libre.',
      dangerOppWinIn: 'VICTOIRE ADVERSE EN {col}',
      dangerOppForkIn: 'FOURCHETTE ADVERSE EN {col}',
      dangerOppWin: 'VICTOIRE ADVERSE',
      centerColName: 'Centre',
      colorYellow: 'Jaune',
      tutorQuickAiThinking: 'À vous de jouer dans un instant !',
      tutorQuickWinRedTitle: 'Victoire pour les Rouges !',
      tutorQuickWinRedDesc: 'L\'alignement de 4 brille sur le plateau. Prenez le temps d\'analyser la position.',
      tutorQuickWinYellowTitle: '{name} a gagné !',
      tutorQuickWinYellowDesc: 'L\'alignement de 4 brille sur le plateau — prenez le temps d\'analyser la position.',

      // Tutor Tactical Evaluation
      tacticalInvalid: 'Coup non valide.',
      tacticalColFull: 'Cette colonne est déjà pleine.',
      tacticalWin: 'Victoire immédiate (100% — Meilleur coup).',
      tacticalWinExplanation: 'En jouant ce coup, vous complétez instantanément un alignement de 4 sur la ligne {row} et gagnez la partie !',
      tacticalFatalBlunder: 'Erreur fatale (0%) : Offre immédiatement la victoire à l\'adversaire.',
      tacticalFatalLoss: 'Défaite immédiate (0%) : Laisse l\'adversaire gagner en colonne {threatCol}.',
      tacticalForcedDefense: 'Parade obligatoire réussie (95%) : Neutralise la défaite imminente.',
      tacticalPreventFork: 'Sauvetage préventif (88%) : Empêche une fourchette adverse imparable au coup suivant.',
      tacticalAllowFork: 'Mène à la défaite en 2 coups (15%) : Permet une double menace imparable en colonne {forkCol}.',
      tacticalCreateFork: 'Fourchette imparable (90%) : Crée deux opportunités de victoire simultanées.',
      tacticalAttackBuild: 'Construction d\'attaque agressive (82%) : Forte force de frappe.',
      tacticalCenterControl: 'Contrôle dominant du centre (75%) : Variété maximale de combinaisons.',
      tacticalSolidPosition: 'Développement solide (65%) : Amélioration sûre de la position.',
      tacticalPassiveFlank: 'Coup d\'aile passif (50%).',
      tacticalUnfavorable: 'Choix de case tactiquement défavorable (38%).',
      tacticalEdgeMove: 'Coup de bord peu dynamique (28%) : Faible potentiel stratégique.',
      tacticalPopoutWin: 'Victoire surprise par réaction en chaîne Pop-Out (100%).',
      tacticalPopoutBlunder: 'Réaction en chaîne fatale (0%) : Donne immédiatement la victoire à l\'adversaire.',
      tacticalPopoutChange: 'Modifie la hauteur des colonnes et peut briser des lignes.',
      tacticalCenterHeadline: 'Contrôle du centre en {col}',
      tacticalCenterDesc: 'Le centre est le cœur du jeu. 16 alignements possibles croisent la colonne 4 dans toutes les directions — potentiel maximal.',
      tacticalCenterQuality: 'Très bon (Centre)',
      tacticalCenterGrade: '75% — Très bon',
      tacticalSolidHeadline: 'Développement solide en {col}',
      tacticalSolidDesc: 'Bon coup de développement : renforce la position et préserve de multiples options.',
      tacticalSolidQuality: 'Développement solide',
      tacticalSolidGrade: '65% — Solide',
      tacticalEdgeHeadline: 'Coup d\'aile / bordure en {col}',
      tacticalEdgeDesc: 'Les coups de bordure offrent moins de lignes gagnantes. Le centre est généralement plus fort.',
      tacticalEdgeQuality: 'Coup d\'aile passif',
      tacticalEdgeGrade: '28% — Coup de bord',
      tacticalMustBlockHeadline: 'Parade vitale en {col} !',
      tacticalMustBlockDesc: 'Ce coup est votre unique parade ! L\'adversaire avait déjà 3 jetons alignés ici.',
      tacticalMustBlockQuality: 'Parade obligatoire (Meilleur coup)',
      tacticalMustBlockGrade: '95% — Parade obligatoire',
      tacticalWinHeadline: 'Victoire immédiate en {col} !',
      tacticalWinQuality: 'Victoire immédiate (100%)',
      tacticalWinGrade: '100% — Coup gagnant',
      tacticalBlunderHeadline: 'Erreur fatale en {col} !',
      tacticalBlunderDesc: 'Attention : si vous jouez ici, l\'adversaire pose directement dessus et gagne immédiatement !',
      tacticalBlunderQuality: 'Erreur fatale (0%)',
      tacticalBlunderGrade: '0% — Erreur fatale',
      tacticalForkHeadline: 'Double menace (Fourchette) en {col} !',
      tacticalForkDesc: 'Coup tactique magistral ! Ce jeton ouvre deux cases gagnantes simultanées. L\'adversaire ne peut en bloquer qu\'une — victoire inéluctable !',
      tacticalForkQuality: 'Magistral (Fourchette)',
      tacticalForkGrade: '90% — Magistral',
      tacticalAttackHeadline: 'Alignement de 3 ouvert en {col} !',
      tacticalAttackDesc: 'Vous créez un alignement de 3 avec des extrémités libres, exerçant une pression décisive.',
      tacticalAttackQuality: 'Très fort (3 ouvert)',
      tacticalAttackGrade: '82% — Très fort',
      tacticalColFullHeadline: 'La {col} est pleine',
      tacticalFatalIgnoreHeadline: 'Erreur fatale : l\'adversaire gagne en {threatCol} !',
      tacticalFatalIgnoreDesc: 'Si vous jouez en {col}, vous ne bloquez pas l\'alignement adverse en {threatCol} ! L\'adversaire y jouera au coup suivant et gagnera immédiatement.',
      tacticalFatalLossQuality: 'Erreur fatale (0%)',
      tacticalFatalLossGrade: '0% — Défaite',
      tacticalPreemptiveHeadline: 'Parade préventive en {col} !',
      tacticalPreemptiveDesc: 'Défense de maître anticipée ! Sans ce coup, l\'adversaire crée un alignement ouvert de 3 au coup suivant. Votre coup neutralise cette menace dans l\'œuf !',
      tacticalPreemptiveQuality: 'Parade préventive (Top)',
      tacticalPreemptiveGrade: '88% — Parade préventive',
      tacticalAllowForkHeadline: 'Danger imminent : fourchette adverse en vue !',
      tacticalAllowForkDesc: 'Attention : si vous jouez en {col}, l\'adversaire peut créer une fourchette en {forkCol} ! Il aura ensuite DEUX cases gagnantes simultanées ({winCols}), entraînant la défaite.',
      tacticalAllowForkQuality: 'Fourchette adverse imminente (15%)',
      tacticalAllowForkGrade: '15% — Défaite en 2 coups',
      tacticalFlankPassableHeadline: 'Coup d\'aile passable en {col}',
      tacticalFlankRiskyHeadline: 'Position risquée en {col}',
      tacticalFlankPassableDesc: 'Position d\'aile avec une influence modérée sur le centre (7 alignements possibles).',
      tacticalFlankRiskyDesc: 'Ce coup apporte peu de contrôle spatial et risque d\'affaiblir votre position.',
      tacticalFlankPassableGrade: '50% — Passable',
      tacticalFlankRiskyGrade: '38% — Risqué',
      tacticalFlankPassableQuality: 'Passable (Moyen)',
      tacticalFlankRiskyQuality: 'Risqué (Faible)',
      badgeFull: 'Plein',
      badgePopWin: '👑 Pop-Victoire',
      badgePopOut: '▲ Pop-Out',
      ratingNotPossible: '0% — Impossible',
      ratingLoss: '0% — Défaite',
      colIsFullQuality: 'Colonne pleine',
      popWinQuality: 'Coup gagnant Pop-Out',
      popBlunderQuality: 'Pop-Out fatal',
      popWinHeadline: 'Pop-Out gagnant en {col} !',
      popWinDesc: 'En retirant le jeton du bas, les jetons supérieurs s\'alignent pour former un alignement de 4 !',
      popBlunderHeadline: 'Pop-Out fatal en {col} !',
      popBlunderDesc: 'Attention ! Retirer ce jeton permet à l\'adversaire d\'aligner 4 jetons et de gagner immédiatement !',
      popNeutralHeadline: 'Pop-Out en {col}',
      popNeutralQuality: 'Pop-Out',
      popNeutralGrade: '50% — Neutre',

      // Modals
      rulesModalHeading: 'Puissance 4 Deluxe — Règles du Jeu',
      rulesModalCloseBtn: 'Compris & Jouer',
      academyModalTitle: 'Puissance 4 — Centre Stratégique & Tactique',
      tabOpenings: '🌟 Variantes d\'ouverture (Premiers coups)',
      tabBlunders: '⚠️ Erreurs majeures fréquentes',
      tabStrategies: '📚 Les 6 stratégies d\'or'
    }
  };

  const I18N = {
    currentLang: 'de',
    translations: translations,

    /**
     * Gibt den übersetzten Text für einen Schlüssel zurück.
     * Unterstützt Platzhalter wie {col}, {n}, {total} usw.
     */
    t(key, params = {}) {
      const langDict = translations[this.currentLang] || translations['de'];
      let str = langDict[key] || translations['de'][key] || key;

      for (const [k, v] of Object.entries(params)) {
        str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), v);
      }
      return str;
    },

    /**
     * Setzt die aktive Sprache ('de' oder 'fr') und aktualisiert das DOM.
     */
    setLanguage(lang) {
      if (lang !== 'de' && lang !== 'fr') lang = 'de';
      this.currentLang = lang;
      document.documentElement.lang = lang;

      try {
        localStorage.setItem('ag_4gewinnt_lang', lang);
      } catch (e) {
        // LocalStorage fallback
      }

      this.updateDOM();
    },

    /**
     * Durchläuft alle Elemente mit data-i18n Attributen und übersetzt sie.
     */
    updateDOM() {
      const lang = this.currentLang;

      // Textinhalt
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key) {
          el.textContent = this.t(key);
        }
      });

      // HTML-Inhalt (falls formatiert)
      document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (key) {
          el.innerHTML = this.t(key);
        }
      });

      // Tooltips / Titles
      document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (key) {
          el.title = this.t(key);
        }
      });

      // Accessibility / ARIA Labels
      document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const key = el.getAttribute('data-i18n-aria');
        if (key) {
          el.setAttribute('aria-label', this.t(key));
        }
      });

      // Umschaltung der zweisprachigen HTML-Bereiche (z. B. Modals)
      document.querySelectorAll('.lang-block-de').forEach(el => {
        el.style.display = (lang === 'de') ? '' : 'none';
      });
      document.querySelectorAll('.lang-block-fr').forEach(el => {
        el.style.display = (lang === 'fr') ? '' : 'none';
      });
    },

    /**
     * Initialisierung beim Laden
     */
    init() {
      // Deutsch ist standardmäßig vorausgewählt laut Kundenwunsch
      let saved = 'de';
      try {
        saved = localStorage.getItem('ag_4gewinnt_lang') || 'de';
      } catch (e) {}

      this.setLanguage(saved);
    }
  };

  window.I18N = I18N;
})(window);
