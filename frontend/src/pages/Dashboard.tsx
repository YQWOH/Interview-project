import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Button, Spin } from "antd";
import {
  PictureOutlined,
  StarOutlined,
  DatabaseOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import type { AnalyticsData } from "@/types";

export default function Dashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await apiService.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Dashboard</h1>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={() => navigate("/images")}
        >
          Upload Image
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Images"
              value={analytics?.summary.totalImages || 0}
              prefix={<PictureOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bookmarked"
              value={analytics?.summary.bookmarkedCount || 0}
              prefix={<StarOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bookmark Rate"
              value={analytics?.summary.bookmarkPercentage || "0"}
              suffix="%"
              precision={1}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Storage"
              value={formatBytes(analytics?.summary.totalSize || 0)}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Quick Actions" bordered={false}>
            <Button
              type="primary"
              block
              style={{ marginBottom: 8 }}
              onClick={() => navigate("/images")}
            >
              View All Images
            </Button>
            <Button
              block
              style={{ marginBottom: 8 }}
              onClick={() => navigate("/images?bookmarked=true")}
            >
              View Bookmarked Images
            </Button>
            <Button block onClick={() => navigate("/analytics")}>
              View Analytics
            </Button>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Activity" bordered={false}>
            <p>Upload trends and recent images will be displayed here.</p>
            <Button type="link" onClick={() => navigate("/analytics")}>
              View Detailed Analytics →
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
