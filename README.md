# Supermarket Manager

A desktop application for supermarket goods management, built with a C backend and Electron + React frontend.

## Architecture

```
supermarket/
├── backend/                # C CLI Backend (standalone)
│   ├── include/            # Header files
│   ├── src/                # Source code (*.c)
│   ├── Makefile            # Build configuration
│   └── README.md
├── desktop/                # Electron Desktop App
│   ├── src/
│   │   ├── main/           # Electron main process
│   │   │   ├── main.js         # Window & IPC setup
│   │   │   ├── preload.js      # Context bridge
│   │   │   ├── database.js     # JSON data storage
│   │   │   └── menu.js         # Application menu
│   │   └── renderer/       # React frontend
│   │       ├── index.html
│   │       ├── index.jsx
│   │       ├── App.jsx
│   │       ├── App.css
│   │       └── components/     # UI components
│   ├── package.json
│   ├── vite.config.js
│   └── electron-builder.yml
├── scripts/                # Build utilities
├── supermarket/            # Original project reference
└── README.md
```

## Features

- **Goods CRUD**: Add, edit, delete, and view goods
- **Search**: By name (KMP substring match), ID (exact), or import date range
- **Sorting**: By ID, profit, or import time (ascending/descending)
- **Smart Date Segments**: Auto-detects continuous date ranges with data
- **Data Persistence**: JSON file storage with import/export
- **Desktop Application**: Standalone Windows installer

## Quick Start

### Prerequisites

- Node.js 18+ (https://nodejs.org)
- GCC/MinGW (for C backend, optional)

### Setup & Run

```bash
# Build C backend (optional)
cd backend
make

# Install desktop dependencies
cd ../desktop
npm install

# Development mode
npm run dev

# Production build (creates installer)
npm run build:win
```

The installer will be in `desktop/dist-electron/`.

## C Backend (CLI)

The C backend can run as a standalone CLI tool:

```bash
cd backend
make run
```

## Data Storage

- Desktop app stores data in JSON format at `%APPDATA%/Supermarket Manager/data/goods.json`
- C backend uses binary `.db` and text `.data` formats
- Desktop app supports import/export of JSON data

## Tech Stack

- **Backend**: C (standard library, linked list, KMP, merge sort)
- **Frontend**: React 18
- **Desktop Shell**: Electron 31
- **Packaging**: electron-builder (NSIS installer)
- **Build Tool**: Vite
