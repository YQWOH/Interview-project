import { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    console.log("onFinish called with:", values);
    setLoading(true);
    try {
      console.log("Attempting login...");
      await login(values.email, values.password);
      console.log("Login successful!");
      message.success("Login successful!");
      navigate("/");
    } catch (error: any) {
      console.error("Login error caught:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);

      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "Invalid credentials. Please check your email and password.";

      console.log("Showing error message:", errorMessage);
      message.error(errorMessage, 5);
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Form validation failed:", errorInfo);
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <h1 className="auth-title">Panorama Viewer</h1>
        <Form
          form={form}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical"
          preserve={true}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              size="large"
              disabled={loading}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
              disabled={loading}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              Log In
            </Button>
          </Form.Item>
          <div style={{ textAlign: "center" }}>
            Don't have an account? <Link to="/register">Register</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
