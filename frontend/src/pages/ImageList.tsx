import { useEffect, useState } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Space,
  Modal,
  Upload,
  Form,
  message,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  StarOutlined,
  StarFilled,
  UploadOutlined,
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiService } from "@/services/api";
import type { PanoramaImage, ImageQueryParams } from "@/types";
import dayjs from "dayjs";

const { Search } = Input;
const { Dragger } = Upload;

export default function ImageList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [images, setImages] = useState<PanoramaImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<ImageQueryParams>({});
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadForm] = Form.useForm();

  // Read URL params on mount
  useEffect(() => {
    const bookmarked = searchParams.get("bookmarked");
    if (bookmarked !== null) {
      setFilters({ bookmarked: bookmarked === "true" });
    }
  }, [searchParams]);

  useEffect(() => {
    fetchImages();
  }, [filters, pagination.current]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await apiService.getImages({
        ...filters,
        page: pagination.current,
        limit: pagination.pageSize,
      });
      setImages(response.data);
      setPagination((prev) => ({ ...prev, total: response.pagination.total }));
    } catch (error) {
      message.error("Failed to fetch images");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleToggleBookmark = async (id: string) => {
    try {
      await apiService.toggleBookmark(id);
      message.success("Bookmark updated");
      fetchImages();
    } catch (error) {
      message.error("Failed to update bookmark");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteImage(id);
      message.success("Image deleted");
      fetchImages();
    } catch (error) {
      message.error("Failed to delete image");
    }
  };

  const handleUpload = async (values: any) => {
    const file = values.image?.file;
    if (!file) {
      message.error("Please select an image");
      return;
    }

    try {
      await apiService.uploadImage(file, values.name);
      message.success("Image uploaded successfully");
      setUploadModalVisible(false);
      uploadForm.resetFields();
      fetchImages();
    } catch (error) {
      message.error("Upload failed");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: PanoramaImage) => (
        <a onClick={() => navigate(`/images/${record._id}`)}>{text}</a>
      ),
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      render: (size: number) => formatBytes(size),
    },
    {
      title: "Uploaded",
      dataIndex: "uploadedAt",
      key: "uploadedAt",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Bookmark",
      dataIndex: "isBookmarked",
      key: "isBookmarked",
      render: (isBookmarked: boolean, record: PanoramaImage) => (
        <Button
          type="text"
          icon={
            isBookmarked ? (
              <StarFilled style={{ color: "#faad14" }} />
            ) : (
              <StarOutlined />
            )
          }
          onClick={() => handleToggleBookmark(record._id)}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: PanoramaImage) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/images/${record._id}`)}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() =>
              window.open(apiService.getDownloadUrl(record._id), "_blank")
            }
          >
            Download
          </Button>
          <Popconfirm
            title="Delete this image?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Panorama Images</h1>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={() => setUploadModalVisible(true)}
        >
          Upload Image
        </Button>
      </div>

      <Space style={{ marginBottom: 16, width: "100%" }} direction="vertical">
        <Space wrap>
          <Search
            placeholder="Search by name"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="Filter by bookmark"
            allowClear
            style={{ width: 200 }}
            value={filters.bookmarked}
            onChange={(value) => handleFilterChange("bookmarked", value)}
          >
            <Select.Option value={true}>Bookmarked</Select.Option>
            <Select.Option value={false}>Not Bookmarked</Select.Option>
          </Select>
          <Select
            placeholder="Sort by"
            defaultValue="uploadedAt"
            style={{ width: 150 }}
            onChange={(value) => handleFilterChange("sortBy", value)}
          >
            <Select.Option value="uploadedAt">Upload Date</Select.Option>
            <Select.Option value="name">Name</Select.Option>
            <Select.Option value="size">Size</Select.Option>
          </Select>
          <Select
            placeholder="Order"
            defaultValue="desc"
            style={{ width: 120 }}
            onChange={(value) => handleFilterChange("order", value)}
          >
            <Select.Option value="desc">Descending</Select.Option>
            <Select.Option value="asc">Ascending</Select.Option>
          </Select>
        </Space>
      </Space>

      <Table
        columns={columns}
        dataSource={images}
        loading={loading}
        rowKey="_id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page) =>
            setPagination((prev) => ({ ...prev, current: page })),
        }}
      />

      <Modal
        title="Upload Panorama Image"
        open={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
          uploadForm.resetFields();
        }}
        footer={null}
      >
        <Form form={uploadForm} onFinish={handleUpload} layout="vertical">
          <Form.Item name="name" label="Image Name (Optional)">
            <Input placeholder="Enter image name" />
          </Form.Item>
          <Form.Item
            name="image"
            label="Image File"
            rules={[{ required: true, message: "Please select an image" }]}
          >
            <Dragger beforeUpload={() => false} maxCount={1} accept="image/*">
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag image to upload</p>
              <p className="ant-upload-hint">
                Support for panorama images (JPG, PNG)
              </p>
            </Dragger>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Upload
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
