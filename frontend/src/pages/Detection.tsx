import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Progress,
  Alert,
  Spin,
  Empty,
  Slider,
  Typography,
  Space,
  Divider,
  Select,
  message,
  Button,
} from "antd";
import {
  RobotOutlined,
  CheckCircleOutlined,
  ExperimentOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useAuthRedux } from "../hooks/useAuthRedux";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface Detection {
  class_id: number;
  class_name: string;
  confidence: number;
  description: string;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
    x_center: number;
    y_center: number;
  };
}

interface AnalysisResult {
  imageId: string;
  imageName: string;
  detections: Detection[];
  metadata: {
    image_width: number;
    image_height: number;
    image_mode: string;
    total_detections: number;
    average_confidence: number;
    model_name: string;
    device: string;
  };
  summary: string;
}

interface UserImage {
  _id: string;
  name: string;
  filename: string;
  filepath: string;
  detections?: {
    detectedAt: string;
    summary: string;
  };
}

import { API_URL } from "@/config/env";

export default function Detection() {
  const { token } = useAuthRedux();
  const [loading, setLoading] = useState(false);
  const [loadingImages, setLoadingImages] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<UserImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.25);
  const [maxDetections, setMaxDetections] = useState(50);

  // Fetch user's uploaded images
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoadingImages(true);
      const response = await axios.get(`${API_URL}/api/images`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Backend returns data directly as array, not data.images
        setImages(response.data.data || []);
      }
    } catch (err: any) {
      console.error("Error fetching images:", err);
      message.error("Failed to load images");
    } finally {
      setLoadingImages(false);
    }
  };

  const handleDetect = async () => {
    if (!selectedImageId) {
      message.warning("Please select an image first");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Call backend API which will communicate with AI service
      const response = await axios.post(
        `${API_URL}/api/detection/${selectedImageId}`,
        {
          confidence_threshold: confidenceThreshold,
          max_detections: maxDetections,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setResult(response.data.data);
        message.success("Detection completed successfully!");
        // Refresh images to show updated detection status
        fetchImages();
      } else {
        setError("Analysis failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Detection error:", err);
      setError(
        err.response?.data?.error?.message ||
          "Failed to analyze image. Make sure the AI service is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return "success";
    if (confidence >= 60) return "processing";
    if (confidence >= 40) return "warning";
    return "default";
  };

  const selectedImage = images.find((img) => img._id === selectedImageId);

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Header */}
        <Card>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Title level={2}>
              <RobotOutlined /> AI Object Detection
            </Title>
            <Paragraph>
              Select an uploaded image to detect objects using our AI-powered
              YOLOv5 model. YOLOv5 provides real-time object detection with
              bounding boxes for 80 common object categories.
            </Paragraph>
            <Alert
              message="Note: You must first upload images in the Images tab before using detection"
              type="info"
              showIcon
            />
          </Space>
        </Card>

        {/* Image Selection */}
        <Card title="Select Image">
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div>
              <Text strong>Choose an uploaded image:</Text>
              <Select
                style={{ width: "100%", marginTop: 8 }}
                placeholder="Select an image to analyze"
                value={selectedImageId}
                onChange={setSelectedImageId}
                loading={loadingImages}
                disabled={loading}
              >
                {images.map((img) => (
                  <Option key={img._id} value={img._id}>
                    {img.name}
                    {img.detections && (
                      <Tag color="green" style={{ marginLeft: 8 }}>
                        Detected
                      </Tag>
                    )}
                  </Option>
                ))}
              </Select>
            </div>

            {images.length === 0 && !loadingImages && (
              <Alert
                message="No images found"
                description="Please upload images in the Images tab first"
                type="warning"
                showIcon
              />
            )}
          </Space>
        </Card>

        {/* Configuration */}
        <Card title="Detection Settings">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Text strong>
                Confidence Threshold: {(confidenceThreshold * 100).toFixed(0)}%
              </Text>
              <Slider
                min={0.1}
                max={1}
                step={0.05}
                value={confidenceThreshold}
                onChange={setConfidenceThreshold}
                marks={{
                  0.1: "10%",
                  0.5: "50%",
                  1: "100%",
                }}
                disabled={loading}
              />
              <Text type="secondary">
                Minimum confidence level for object detection
              </Text>
            </Col>
            <Col xs={24} md={12}>
              <Text strong>Maximum Detections: {maxDetections}</Text>
              <Slider
                min={1}
                max={20}
                step={1}
                value={maxDetections}
                onChange={setMaxDetections}
                marks={{
                  1: "1",
                  10: "10",
                  20: "20",
                }}
                disabled={loading}
              />
              <Text type="secondary">Maximum number of objects to detect</Text>
            </Col>
          </Row>
          <Divider />
          <Button
            type="primary"
            size="large"
            icon={<RobotOutlined />}
            onClick={handleDetect}
            loading={loading}
            disabled={!selectedImageId || loading}
          >
            {loading ? "Analyzing..." : "Detect Objects"}
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchImages}
            style={{ marginLeft: 8 }}
            disabled={loading}
          >
            Refresh Images
          </Button>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text>Analyzing image with AI model...</Text>
              </div>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Alert
            message="Analysis Error"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}

        {/* Results */}
        {result && !loading && (
          <>
            {/* Summary Card */}
            <Card>
              <Alert
                message="Analysis Complete"
                description={result.summary}
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
              />
            </Card>

            {/* Image and Stats */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={24}>
                <Card title="Analyzed Image with Detections">
                  {selectedImage && (
                    <>
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          overflow: "auto",
                        }}
                      >
                        <canvas
                          ref={(canvas) => {
                            if (canvas && result) {
                              const img = new Image();
                              img.crossOrigin = "anonymous";
                              img.src = `${API_URL}/uploads/${selectedImage.filename}`;
                              img.onload = () => {
                                // Set canvas size to match image
                                canvas.width = img.width;
                                canvas.height = img.height;

                                const ctx = canvas.getContext("2d");
                                if (ctx) {
                                  // Draw image
                                  ctx.drawImage(img, 0, 0);

                                  // Draw bounding boxes
                                  result.detections.forEach(
                                    (detection, idx) => {
                                      if (detection.bbox) {
                                        const { x, y, width, height } =
                                          detection.bbox;

                                        // Generate color based on class
                                        const hue = (idx * 137.5) % 360;
                                        const color = `hsl(${hue}, 70%, 50%)`;

                                        // Draw box
                                        ctx.strokeStyle = color;
                                        ctx.lineWidth = 4;
                                        ctx.strokeRect(x, y, width, height);

                                        // Draw label background
                                        const label = `${
                                          detection.class_name
                                        } ${detection.confidence.toFixed(1)}%`;
                                        ctx.font = "bold 20px Arial";
                                        const textMetrics =
                                          ctx.measureText(label);
                                        const textHeight = 28;

                                        ctx.fillStyle = color;
                                        ctx.fillRect(
                                          x,
                                          y - textHeight,
                                          textMetrics.width + 16,
                                          textHeight
                                        );

                                        // Draw label text
                                        ctx.fillStyle = "white";
                                        ctx.fillText(label, x + 8, y - 8);
                                      }
                                    }
                                  );
                                }
                              };
                            }
                          }}
                          style={{
                            width: "100%",
                            height: "auto",
                            borderRadius: "8px",
                            border: "1px solid #d9d9d9",
                          }}
                        />
                      </div>
                      <div style={{ marginTop: 16 }}>
                        <Text strong>{selectedImage.name}</Text>
                        <Text type="secondary" style={{ marginLeft: 16 }}>
                          {result.detections.length} objects detected
                        </Text>
                      </div>
                    </>
                  )}
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Statistics">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic
                        title="Total Detections"
                        value={result.metadata.total_detections}
                        prefix={<ExperimentOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Avg Confidence"
                        value={result.metadata.average_confidence}
                        suffix="%"
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Image Size"
                        value={`${result.metadata.image_width}×${result.metadata.image_height}`}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Model"
                        value={result.metadata.model_name}
                      />
                    </Col>
                  </Row>
                  <Divider />
                  <Space direction="vertical" size="small">
                    <Text type="secondary">
                      <strong>Device:</strong> {result.metadata.device}
                    </Text>
                    <Text type="secondary">
                      <strong>Color Mode:</strong> {result.metadata.image_mode}
                    </Text>
                  </Space>
                </Card>
              </Col>
            </Row>

            {/* Detections List */}
            <Card title="Detected Objects">
              {result.detections.length > 0 ? (
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  {result.detections.map((detection, index) => (
                    <Card
                      key={`${detection.class_id}-${index}`}
                      size="small"
                      style={{
                        borderLeft: `4px solid ${
                          detection.confidence >= 80
                            ? "#52c41a"
                            : detection.confidence >= 60
                            ? "#1890ff"
                            : detection.confidence >= 40
                            ? "#faad14"
                            : "#d9d9d9"
                        }`,
                      }}
                    >
                      <Row gutter={[16, 8]} align="middle">
                        <Col xs={24} sm={12}>
                          <Space>
                            <Tag
                              color={getConfidenceColor(detection.confidence)}
                            >
                              #{index + 1}
                            </Tag>
                            <Text strong style={{ fontSize: 16 }}>
                              {detection.class_name}
                            </Text>
                          </Space>
                        </Col>
                        <Col xs={24} sm={12}>
                          <div style={{ textAlign: "right" }}>
                            <Progress
                              percent={detection.confidence}
                              size="small"
                              status={
                                detection.confidence >= 80
                                  ? "success"
                                  : detection.confidence >= 60
                                  ? "active"
                                  : "normal"
                              }
                            />
                          </div>
                        </Col>
                        <Col span={24}>
                          <Text type="secondary">{detection.description}</Text>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </Space>
              ) : (
                <Empty description="No objects detected with current threshold" />
              )}
            </Card>
          </>
        )}

        {/* Info Card */}
        {!result && !loading && (
          <Card>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Title level={4}>How it works</Title>
              <Paragraph>
                Our AI detection service uses YOLOv5 (You Only Look Once), a
                state-of-the-art real-time object detection model. YOLOv5
                detects objects and provides bounding box coordinates, trained
                on the COCO dataset with 80 common object categories including
                people, vehicles, animals, and everyday items.
              </Paragraph>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Card size="small">
                    <Statistic
                      title="Model"
                      value="YOLOv5s"
                      prefix={<RobotOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card size="small">
                    <Statistic title="Categories" value="80" />
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card size="small">
                    <Statistic title="Dataset" value="COCO" />
                  </Card>
                </Col>
              </Row>
            </Space>
          </Card>
        )}
      </Space>
    </div>
  );
}
