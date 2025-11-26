import { Layout, Menu } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  PictureOutlined,
  BarChartOutlined,
  RobotOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useAuthRedux } from "@/hooks/useAuthRedux";

const { Header, Sider, Content } = Layout;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthRedux();

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/images",
      icon: <PictureOutlined />,
      label: "Images",
    },
    {
      key: "/analytics",
      icon: <BarChartOutlined />,
      label: "Analytics",
    },
    {
      key: "/detection",
      icon: <RobotOutlined />,
      label: "Detection",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div
          style={{
            height: 32,
            margin: 16,
            color: "white",
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Panorama
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0 }}>Panorama Viewer</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span>Welcome, {user?.name}</span>
            <LogoutOutlined
              onClick={handleLogout}
              style={{ cursor: "pointer", fontSize: 18 }}
            />
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: "#fff",
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
