import { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: {
    name: string;
    email: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      await register(values.name, values.email, values.password);
      message.success("Registration successful!");
      navigate("/");
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";
      message.error(errorMessage, 5);
      // Keep form values by not resetting
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <Form form={form} onFinish={onFinish} layout="vertical" preserve={true}>
          <Form.Item
            name="name"
            rules={[{ required: true, message: "Please input your name!" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Full Name"
              size="large"
              disabled={loading}
            />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              size="large"
              disabled={loading}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Please input your password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
              disabled={loading}
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
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
              Register
            </Button>
          </Form.Item>
          <div style={{ textAlign: "center" }}>
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
