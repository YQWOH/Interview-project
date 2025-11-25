import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Spin } from "antd";
import {
  PictureOutlined,
  StarOutlined,
  DatabaseOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { apiService } from "@/services/api";
import type { AnalyticsData } from "@/types";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function Analytics() {
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

  const bookmarkData =
    analytics?.sizeByBookmark.map((item) => ({
      name: item.isBookmarked ? "Bookmarked" : "Not Bookmarked",
      value: item.count,
      size: item.totalSize,
    })) || [];

  const uploadTrendData =
    analytics?.uploadTrend.map((item) => ({
      date: item.date,
      count: item.count,
    })) || [];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Analytics Dashboard</h1>

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
              prefix={<RiseOutlined />}
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
          <Card title="Upload Trend">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={uploadTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#1890ff"
                  strokeWidth={2}
                  name="Images Uploaded"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Bookmark Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bookmarkData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bookmarkData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="Storage by Bookmark Status">
            <Row gutter={16}>
              {analytics?.sizeByBookmark.map((item, index) => (
                <Col xs={24} sm={12} key={index}>
                  <Card>
                    <Statistic
                      title={
                        item.isBookmarked
                          ? "Bookmarked Images Storage"
                          : "Other Images Storage"
                      }
                      value={formatBytes(item.totalSize)}
                      suffix={`(${item.count} images)`}
                      valueStyle={{ color: COLORS[index % COLORS.length] }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
