# 🔴🟡 Vier Gewinnt Deluxe (Connect Four) mit KI & Bonus-Regeln

Ein interaktives, modernes **Vier Gewinnt**-Spiel mit 2-Spieler-Modus, einer 4-stufigen Künstlichen Intelligenz (Minimax mit $\alpha$-$\beta$-Pruning) und spannenden Zusatz-Herausforderungen.

---

## 🚀 Spiel starten

Es wird **keine Installation von Node.js oder Python** benötigt! Das Spiel läuft direkt in jedem modernen Webbrowser (Chrome, Edge, Firefox, Safari).

### Schnurstracks loslegen:
1. Öffne die Datei [index.html](file:///c:/antigravity/ag_4gewinnt/index.html) direkt per Doppelklick in deinem Browser, **ODER**
2. Führe im Projektverzeichnis [start_spiel.bat](file:///c:/antigravity/ag_4gewinnt/start_spiel.bat) aus.

---

## 🎮 Spielmodi & Features

* **1 Spieler vs. Computer (KI):** Spiele gegen die KI mit 4 frei wählbaren Spielstärken.
* **2 Spieler (Hotseat):** Spiele lokal mit einem Freund am selben Bildschirm.
* **Zug zurücknehmen (Undo):** Fehler gemacht? Nimm deinen Zug mit einem Klick zurück.
* **Live-Statistiken:** Zählt Siege, Niederlagen, Unentschieden und Züge pro Runde.
* **Synthesizer-Soundeffekte:** Dynamische Sounds über die Web Audio API (keine externen Sounddateien nötig, stummschaltbar).
* **Gewinn-Hervorhebung:** Die 4 siegreichen Steine pulsieren strahlend auf dem Brett.

---

## 🌟 Die Bonus-Herausforderungen (Zusatzregeln)

In der linken Menüleiste unter **"Zusatz-Regeln"** kannst du diese Features zuschalten:

1. **Pop-Out Regel (Bekannte Hasbro-Variante):**
   * Statt einen neuen Stein oben einzuwerfen, kannst du deinen **untersten eigenen Stein** aus einer Spalte herausziehen!
   * Alle Steine darüber rutschen um 1 Position nach unten.
   * Dadurch können völlig unerwartete 4er-Ketten ausgelöst oder gegnerische Fallen zerstört werden.
2. **Sperrfelder (Hindernisse):**
   * Zu Beginn jeder Runde werden **zwei zufällige Barrieren (graue Hindernisse)** auf dem Spielfeld platziert.
   * Diese Felder blockieren Linien und Schwerkraftwege – hier müssen Mensch und KI ihre Strategie von Grund auf anpassen!

---

## 🧠 Wie funktioniert die KI? (Minimax & Alpha-Beta verständlich erklärt)

Vier Gewinnt ist ein sogenanntes **Nullsummenspiel mit vollständiger Information**: Beide Spieler sehen zu jedem Zeitpunkt das gesamte Spielfeld, und es gibt keinen Zufall (beim Würfeln oder verdeckten Karten).

### 1. Der Minimax-Algorithmus
Die KI denkt wie ein Schachspieler mehrere Schritte voraus:
* **MAX-Schritt (KI am Zug):** Die KI sucht nach dem Zug, der ihren Gewinnwert **maximiert** ($+10.000$ Punkte für Sieg).
* **MIN-Schritt (Mensch am Zug):** Die KI nimmt an, dass der Mensch intelligent spielt und den Punktestand der KI **minimieren** will ($-10.000$ Punkte für Spielerverlust).
* Die KI bewertet Stellungen anhand von:
  1. Direkten 4er-Gewinnen.
  2. Bedrohungen: 3 Steine mit offenem Feld (sofort blocken oder vollenden).
  3. **Zentrumskontrolle:** Die mittlere Spalte (Spalte 4 / Index 3) bietet statistisch die meisten 4er-Linien im gesamten Spiel und wird höher bewertet.

### 2. Was ist Alpha-Beta-Pruning?
Normalerweise wächst der Suchbaum rasant an ($7^{\text{Tiefe}}$). Bei 7 Zügen Tiefe sind das über 5,7 Millionen Varianten!

**Alpha-Beta-Pruning** schneidet Zweige im Baum ab, sobald feststeht, dass sie irrelevant sind:
* Wenn die KI bei Zug A bereits weiß: *„Hier habe ich mindestens ein Unentschieden sicher (Wert 0)“*,
* und bei Zug B sieht sie im ersten Gegenzug schon: *„Der Gegner kann mich hier sofort schlagen (Wert -100)“*,
* dann **bricht sie die Prüfung von Zug B sofort ab**!
* Dadurch rechnet die KI **bis zu 10-mal schneller** und kann in wenigen Millisekunden viel weiter in die Zukunft sehen.

### 3. Die 4 Spielstärken im Spiel

| Stufe | Rechentiefe | Verhalten |
| :--- | :--- | :--- |
| **1. Anfänger** | 1 Zug | Schaut nicht voraus. Erkennt nur direkte Sofort-Siege, übersieht Fallen und streut ca. 35% Zufallszüge ein. |
| **2. Fortgeschritten** | 3 Züge | Sieht einfache Gegenangriffe voraus, besetzt das Zentrum und blockt 3er-Reihen ab. |
| **3. Taktiker** | 5 Züge | Erkennt "Gabelungen" (Doppelbedrohungen, bei denen der Gegner an zwei Stellen gleichzeitig gewinnen kann). |
| **4. Meister** | 7–8 Züge | Nutzt die volle Rechentiefe von Minimax mit Ast-Schnitt. Spielt nahezu unbesiegbar! |

---

## 📁 Dateistruktur

```
ag_4gewinnt/
├── index.html       # Benutzeroberfläche, Spielfeld & Modals
├── style.css        # Modernes Arcade/Glassmorphism Design & CSS-Animationen
├── ai.js            # Minimax-Algorithmus mit Alpha-Beta-Pruning & Heuristik
├── game.js          # Spielmechanik, Web Audio Sounds, Undo & Event-Handler
├── start_spiel.bat  # Start-Verknüpfung per Doppelklick
└── README.md        # Detaillierte Dokumentation
```
