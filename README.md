# 🏋️ Iron Log

**Iron Log** is a personal fitness tracking Progressive Web App designed to manage workouts, training programs, body measurements, nutrition, extra activities and long-term progress.

The goal of the project is to provide a single, lightweight interface for recording daily fitness data and turning it into useful statistics and progress insights.

The application is designed to work primarily on the client side, with data stored locally in the browser and no backend required.

---

## ✨ Features

### 🏋️ Workout Tracking

Iron Log allows users to record and review their training sessions, including:

* Exercises
* Sets and repetitions
* Load used
* Training volume
* Workout duration
* Workout history
* Training-day information
* Workout completion flow

The application keeps the training history organized by date and associates each session with the active training program.

---

### 📋 Training Programs

The app supports multiple training programs throughout the year.

Programs are separated into:

* **Active program** — the training plan currently in use
* **Program archive** — previously created or used programs

Each workout session stores information about the program it belongs to, including:

```text
programId
programName
dayColor
```

This allows historical workouts, calendars and programs to remain consistent even after switching to a new training plan.

---

### ⚖️ Body & Nutrition Tracking

The **Body** section provides a dedicated space for tracking physical and nutritional information.

Supported data includes:

* Body weight
* Historical body measurements
* Nutrition
* Macronutrient split
* Daily calories
* Extra physical activities
* Historical progress

The application combines these data sources to provide a broader overview of daily fitness progress rather than focusing exclusively on gym performance.

---

### 📊 Statistics & Analytics

Iron Log includes several statistics and analytical views to monitor progress over time.

The application calculates and displays information such as:

* Training volume
* Workout duration
* Calories burned
* Body-weight trends
* Nutrition data
* Activity data
* Training scores
* Weekly summaries
* Historical statistics

Charts and statistical cards provide a visual overview of the user's progress.

---

### 📅 Calendar & Activity Tracking

The application includes a calendar-based activity view for organizing daily fitness information.

Extra activities can be recorded alongside gym sessions, allowing different types of physical activity to contribute to the overall daily picture.

---

### 📈 Weekly Summary

The home dashboard provides a weekly overview of the user's activity.

The summary combines information from workouts, nutrition, body data and extra activities to provide a quick snapshot of the current week.

---

### 🧠 Advanced Analysis

Iron Log includes an advanced analysis section that combines the application's stored data into additional progress and performance indicators.

The project also includes configurable UI themes, density settings and notification-related functionality.

---

### 📤 Daily Summary Sharing

A dedicated daily sharing card is available from:

```text
Home
└── Daily statistics

Body
└── Day
```

The generated summary can include:

* Workout information
* Training volume
* Workout duration
* Calories burned
* Nutrition
* Macronutrient distribution
* Extra activities
* Body weight
* Daily score

If native sharing is not available on the device, the summary is copied to the clipboard as a fallback.

---

### 💾 Backup & Restore

Iron Log stores data locally but provides a JSON backup system.

The backup includes:

* Main application data
* Compatible local preferences
* Training history
* Programs
* Fitness data

This makes it possible to export personal data and restore it later without relying on an external database.

---

### 📱 Progressive Web App

Iron Log is implemented as a **Progressive Web App (PWA)**.

The project includes:

* `manifest.json`
* Service worker
* Installable application
* Offline caching
* Mobile-friendly interface

After the initial loading phase, the service worker caches the application files and external libraries, allowing the app to continue working without an active network connection.

---

## 🏗️ Architecture

The project follows a modular frontend architecture.

```text
iron-log/
│
├── index.html
│
├── styles/
│   └── app.css
│
├── src/
│   ├── app.jsx
│   │
│   ├── core/
│   │   ├── constants.js
│   │   └── metrics.js
│   │
│   ├── ui/
│   │   └── theme.js
│   │
│   ├── components/
│   │   ├── workout.jsx
│   │   ├── body.jsx
│   │   ├── charts.jsx
│   │   ├── activity.jsx
│   │   ├── week-summary.jsx
│   │   ├── advanced-analysis.jsx
│   │   ├── workout-flow.jsx
│   │   └── navigation.jsx
│   │
│   └── pwa.js
│
├── sw.js
├── manifest.json
└── README.md
```

### Core

`src/core/` contains the application's shared logic:

* Constants and application configuration
* Data keys
* Calculations
* Progression logic
* Scores
* Analytics
* Storage helpers

### Components

The UI is divided into functional React components covering:

* Workout logging
* Body and nutrition
* Charts
* Activities
* Weekly summaries
* Advanced analysis
* Workout flow
* Navigation

### PWA Layer

`src/pwa.js`, `sw.js` and `manifest.json` provide the installation and offline functionality.

---

## 🛠️ Tech Stack

* **React** — component-based UI
* **JavaScript / JSX** — application logic
* **Babel** — JSX transpilation
* **CSS** — styling, animations and responsive UI
* **Web APIs** — browser capabilities such as clipboard and sharing
* **localStorage** — persistent client-side data
* **Service Worker** — offline caching
* **Web App Manifest** — PWA installation

The application intentionally does not require a backend or external database.

React and Babel are loaded through CDN resources, keeping the project lightweight and avoiding a traditional frontend build pipeline.

---

## 💾 Data Storage

All application data is stored locally in the user's browser using `localStorage`.

Iron Log uses a dedicated key namespace beginning with:

```text
il_
```

This keeps application data separated from unrelated browser storage.

Examples of the application's persistent data include:

```text
il_programs
il_active_program
```

The active program and the complete program archive are therefore maintained separately.

---

## 📅 Date Handling

Dates are stored using the local format:

```text
YYYY-MM-DD
```

rather than relying exclusively on UTC timestamps.

This avoids unwanted day shifts around midnight caused by timezone conversions and makes daily fitness tracking more predictable.

---

## 🚀 Getting Started

Iron Log does not require a traditional build process.

### 1. Clone the repository

```bash
git clone https://github.com/massimoparlanti2/iron-log.git
cd iron-log
```

### 2. Start a local HTTP server

Using Python:

```bash
python3 -m http.server 8080
```

### 3. Open the application

Visit:

```text
http://localhost:8080
```

> A local HTTP server is recommended instead of opening `index.html` directly, especially for service-worker and PWA functionality.

---

## 🌐 Offline Behavior

The first application load requires an internet connection because React, Babel and other external resources are loaded from CDN sources.

After installation/loading, the service worker caches the required resources.

The application can therefore continue to operate offline using the data already stored in the browser.

---

## 🔐 Privacy

Iron Log is designed around local-first data storage.

Fitness and personal tracking data are stored in the browser's `localStorage` rather than being sent to a dedicated application backend.

This means the application does not require:

* User accounts
* A remote database
* A backend server
* Cloud synchronization

However, local browser storage is device/browser-specific. Clearing browser data or using another browser/device does not automatically transfer the stored information.

For this reason, the built-in JSON backup functionality is important for preserving data.

---

## 🎯 Project Goals

Iron Log was developed to solve a simple problem:

> **Turn everyday fitness tracking into structured, searchable and measurable data.**

Instead of keeping workout information, body weight, nutrition and activities in separate notes or spreadsheets, the application brings them together into a single interface.

The project focuses on:

* Consistent workout logging
* Long-term progress tracking
* Data visualization
* Personal analytics
* Local-first data ownership
* Offline accessibility
* A lightweight architecture

---

## 🔮 Future Improvements

Possible future developments include:

* ☁️ Optional cloud synchronization
* 📱 Improved mobile UX
* 📊 More advanced progress analytics
* 🏋️ Exercise progression analysis
* 📈 Personal records and strength trends
* 🔄 Automatic backup synchronization
* 🤖 AI-assisted workout analysis
* 🧠 Training recommendations based on historical data
* 📉 Automatic plateau detection
* 🥗 More detailed nutrition analytics
* ⌚ Integration with wearable devices
* 📅 Calendar integrations
* 👤 Multiple profiles

---

## 👨‍💻 Author

**Massimo Parlanti**

MSc Artificial Intelligence student at the University of Pisa.

GitHub: [@massimoparlanti2](https://github.com/massimoparlanti2)

---

## 📄 License

This project is currently intended primarily for personal use and experimentation.

No specific open-source license has currently been defined.
