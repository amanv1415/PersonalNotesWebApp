import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './components/Dashboard';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ThemeProvider>
      <Dashboard />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '0.875rem',
            fontFamily: 'Inter, system-ui, sans-serif',
            boxShadow: 'var(--shadow-lg)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: 'white' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: 'white' },
          },
        }}
      />
    </ThemeProvider>
  );
}

export default App;
