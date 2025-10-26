# Song Files

An offline-first iOS/iPadOS app for singers to import PDF songs, organize them into playlists (setlists), and annotate in performance mode.

## Features

- **Offline-first**: No internet required - all data stored locally
- **PDF Import**: Import PDF songs via iOS Files picker with duplicate detection
- **Smart Auto-rename**: Automatically suggests title and artist from PDF content
- **Playlist Management**: Create, organize, and reorder song playlists
- **Performance Mode**: Full-screen PDF viewer with swipe navigation
- **Annotations**: Draw, highlight, and annotate songs (playlist-scoped)
- **Search**: Fuzzy search across song titles, artists, and filenames
- **Keep-Awake**: Screen stays on during performance mode

## Tech Stack

- **Framework**: React + TypeScript + Vite
- **Styling**: TailwindCSS with iOS-friendly design
- **State Management**: Zustand
- **Routing**: React Router
- **Storage**: Dexie (IndexedDB) + Capacitor Filesystem
- **PDF Rendering**: pdfjs-dist
- **Mobile**: Capacitor for iOS deployment
- **Gestures**: @dnd-kit for drag-and-drop
- **Search**: Fuse.js for fuzzy search

## Project Structure

```
src/
├── components/
│   ├── Library/           # Song library components
│   ├── Playlists/         # Playlist management
│   └── PdfViewer/         # PDF viewer and annotations
├── pages/                 # Main app pages
├── services/              # Business logic services
├── stores/                # Zustand state management
├── db/                    # Dexie database setup
└── types.ts               # TypeScript definitions
```

## Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## iOS Deployment

1. **Sync with Capacitor**:
   ```bash
   npx cap sync ios
   ```

2. **Open in Xcode**:
   ```bash
   npx cap open ios
   ```

3. **Run on device/simulator**:
   - Select your target device in Xcode
   - Click the Run button (▶️)

## Key Features Implementation

### PDF Import & Duplicate Detection
- Uses SHA-256 content hashing to detect duplicate files
- Auto-extracts title and artist from first page text
- Stores files in `Documents/songs/` directory

### Annotations System
- Non-destructive vector overlays stored as JSON
- Playlist-scoped annotations (same song, different annotations per playlist)
- Undo/redo functionality with stroke history
- Tools: pen, highlighter, eraser

### Performance Mode
- Full-screen PDF viewer optimized for stage use
- Swipe left/right to navigate between songs
- Keep-awake functionality to prevent screen dimming
- Hide UI option for distraction-free performance

### Search & Organization
- Fuzzy search across metadata (title, artist, filename)
- Drag-and-drop playlist reordering
- Multi-select for bulk operations

## File Storage

- **Songs**: `Documents/songs/{songId}.pdf`
- **Annotations**: `Documents/annotations/{playlistId}/{songId}.json`
- **Metadata**: IndexedDB via Dexie

## Configuration

The app follows iOS design guidelines with:
- SF Pro font family
- iOS-style rounded corners and shadows
- System theme support (light/dark)
- Accessible touch targets

## Sample Data

For testing, use the "Sample Data" button in the Library to generate:
- 3 sample songs with realistic metadata
- 3 sample playlists
- Pre-populated playlist with songs

## Future Enhancements

- Share Sheet extension for importing from other apps
- Cloud sync capabilities
- PDF flattening/export functionality
- Full-text OCR for better search
- Advanced annotation tools (shapes, text boxes)

## License

This project is built for educational and personal use.