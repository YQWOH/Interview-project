import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Descriptions, Spin, message, Space } from "antd";
import {
  ArrowLeftOutlined,
  StarOutlined,
  StarFilled,
  DownloadOutlined,
} from "@ant-design/icons";
import * as THREE from "three";
import { apiService } from "@/services/api";
import type { PanoramaImage } from "@/types";
import dayjs from "dayjs";

export default function ImageViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [image, setImage] = useState<PanoramaImage | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (id) {
      fetchImage();
    }
  }, [id]);

  useEffect(() => {
    if (image && containerRef.current) {
      initPanoramaViewer();
    }

    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [image]);

  const fetchImage = async () => {
    try {
      const response = await apiService.getImageById(id!);
      setImage(response.data);
    } catch (error) {
      message.error("Failed to load image");
      navigate("/images");
    } finally {
      setLoading(false);
    }
  };

  const initPanoramaViewer = () => {
    if (!containerRef.current || !image) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0.1);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Sphere geometry for panorama
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1); // Invert for inside view

    // Load texture
    const textureLoader = new THREE.TextureLoader();
    const imageUrl = apiService.getImageUrl(image.filepath);

    textureLoader.load(
      imageUrl,
      (texture) => {
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        meshRef.current = mesh;
      },
      undefined,
      (error) => {
        console.error("Error loading texture:", error);
        message.error("Failed to load panorama image");
      }
    );

    // Mouse controls
    let isUserInteracting = false;
    let onPointerDownMouseX = 0;
    let onPointerDownMouseY = 0;
    let lon = 0;
    let onPointerDownLon = 0;
    let lat = 0;
    let onPointerDownLat = 0;

    const onPointerDown = (event: MouseEvent) => {
      isUserInteracting = true;
      onPointerDownMouseX = event.clientX;
      onPointerDownMouseY = event.clientY;
      onPointerDownLon = lon;
      onPointerDownLat = lat;
    };

    const onPointerMove = (event: MouseEvent) => {
      if (isUserInteracting) {
        lon = (onPointerDownMouseX - event.clientX) * 0.1 + onPointerDownLon;
        lat = (event.clientY - onPointerDownMouseY) * 0.1 + onPointerDownLat;
      }
    };

    const onPointerUp = () => {
      isUserInteracting = false;
    };

    container.addEventListener("mousedown", onPointerDown);
    container.addEventListener("mousemove", onPointerMove);
    container.addEventListener("mouseup", onPointerUp);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      lat = Math.max(-85, Math.min(85, lat));
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);

      const target = new THREE.Vector3(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta)
      );

      camera.lookAt(target);
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      container.removeEventListener("mousedown", onPointerDown);
      container.removeEventListener("mousemove", onPointerMove);
      container.removeEventListener("mouseup", onPointerUp);
      window.removeEventListener("resize", handleResize);
    };
  };

  const handleToggleBookmark = async () => {
    if (!image) return;
    try {
      await apiService.toggleBookmark(image._id);
      setImage({ ...image, isBookmarked: !image.isBookmarked });
      message.success("Bookmark updated");
    } catch (error) {
      message.error("Failed to update bookmark");
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

  if (!image) {
    return <div>Image not found</div>;
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/images")}
        >
          Back to Images
        </Button>
        <Button
          icon={
            image.isBookmarked ? (
              <StarFilled style={{ color: "#faad14" }} />
            ) : (
              <StarOutlined />
            )
          }
          onClick={handleToggleBookmark}
        >
          {image.isBookmarked ? "Bookmarked" : "Bookmark"}
        </Button>
        <Button
          icon={<DownloadOutlined />}
          onClick={() =>
            window.open(apiService.getDownloadUrl(image._id), "_blank")
          }
        >
          Download
        </Button>
      </Space>

      <Card title={image.name} style={{ marginBottom: 16 }}>
        <div
          ref={containerRef}
          className="panorama-viewer-container"
          style={{ cursor: "grab" }}
        />
        <p style={{ marginTop: 16, color: "#666", textAlign: "center" }}>
          Click and drag to look around the panorama
        </p>
      </Card>

      <Card title="Image Details">
        <Descriptions column={2}>
          <Descriptions.Item label="Name">{image.name}</Descriptions.Item>
          <Descriptions.Item label="Original Name">
            {image.originalName}
          </Descriptions.Item>
          <Descriptions.Item label="Size">
            {formatBytes(image.size)}
          </Descriptions.Item>
          <Descriptions.Item label="Type">{image.mimetype}</Descriptions.Item>
          <Descriptions.Item label="Uploaded">
            {dayjs(image.uploadedAt).format("YYYY-MM-DD HH:mm:ss")}
          </Descriptions.Item>
          <Descriptions.Item label="Bookmarked">
            {image.isBookmarked ? "Yes" : "No"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
