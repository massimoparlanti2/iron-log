# Iron Log

Diario personale per allenamenti, schede, peso, nutrizione, attivita extra e statistiche.

## Struttura

- `index.html` carica l'app e le librerie esterne.
- `styles/app.css` contiene gli stili globali e le animazioni.
- `src/core/constants.js` contiene liste, colori e chiavi dati.
- `src/core/metrics.js` contiene calcoli, progressioni, score, analytics e storage helper.
- `src/ui/theme.js` contiene temi, densita UI e stili condivisi.
- `src/components/workout.jsx` contiene componenti del log allenamento.
- `src/components/body.jsx` contiene fisico, nutrizione, peso e storico.
- `src/components/charts.jsx` contiene grafici e card statistiche principali.
- `src/components/activity.jsx` contiene calendario e attivita extra.
- `src/components/week-summary.jsx` contiene il riepilogo settimanale della home.
- `src/components/advanced-analysis.jsx` contiene analisi avanzate, tema e notifiche.
- `src/components/workout-flow.jsx` contiene check-in, confetti e schermata fine allenamento.
- `src/components/navigation.jsx` contiene la barra di navigazione.
- `src/app.jsx` contiene il contenitore principale, backup/import e setup programma.
- `src/pwa.js`, `sw.js` e `manifest.json` gestiscono installazione e offline.

## Schede

L'app supporta piu schede durante l'anno.
La chiave `il_programs` contiene l'archivio completo, mentre `il_active_program`
contiene la scheda attiva. Ogni nuova sessione salva anche `programId`,
`programName` e `dayColor`, cosi storico, calendario e programma restano coerenti.

## Avvio locale

Apri la cartella con un piccolo server statico:

```bash
python3 -m http.server 8080
```

Poi visita `http://localhost:8080`.

## Dati

I dati restano nel browser, in `localStorage`, usando chiavi che iniziano con `il_`.
Il backup JSON esporta sia i dati principali sia le preferenze locali compatibili.

## Note

L'app usa React e Babel da CDN, quindi per il primo caricamento serve connessione.
Dopo l'installazione, il service worker mette in cache i file dell'app e le librerie.
