import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ImageList from "./pages/ImageList";
import ImageViewer from "./pages/ImageViewer";
import Analytics from "./pages/Analytics";
import Detection from "./pages/Detection";
import AppLayout from "./components/Layout/AppLayout";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading state while verifying token
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#1890ff" } }}>
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
              <Route path="detection" element={<Detection />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
