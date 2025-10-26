import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes.tsx'
import { ThemeProvider } from './contexts/ThemeContext'
import './index.css'

// Initialize Capacitor
import { Capacitor } from '@capacitor/core';

// Initialize filesystem service
import { fsService } from './services/fs.service';

// Ensure directories exist on app start
if (Capacitor.isNativePlatform()) {
  fsService.ensureDirectories().catch(console.error);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
)