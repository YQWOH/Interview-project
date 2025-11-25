#!/bin/bash

# Script to generate all frontend source files
# Run this after npm install

echo "Generating frontend source files..."

# Create main entry files
cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

cat > src/App.tsx << 'EOF'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ImageList from './pages/ImageList'
import ImageViewer from './pages/ImageViewer'
import Analytics from './pages/Analytics'
import AppLayout from './components/Layout/AppLayout'

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1890ff' } }}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <AppLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="images" element={<ImageList />} />
              <Route path="images/:id" element={<ImageViewer />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  )
}

export default App
EOF

# Create index.html
cat > index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Panorama Viewer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

# Create styles
cat > src/styles/index.css << 'EOF'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  min-height: 100vh;
}

.panorama-viewer-container {
  width: 100%;
  height: 600px;
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.panorama-viewer-container canvas {
  display: block;
}

.viewer-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 10px;
}
EOF

echo "✅ Core files generated!"
echo ""
echo "Next steps:"
echo "1. cd frontend"
echo "2. npm install"
echo "3. chmod +x generate-components.sh"
echo "4. ./generate-components.sh"
echo "5. npm run dev"
EOF

chmod +x generate-files.sh
