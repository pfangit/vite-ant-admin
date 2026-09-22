import { useRequest } from "alova/client";
import {
  Button,
  Card,
  Checkbox,
  Flex,
  Form,
  Input,
  message,
  Tabs,
  Typography,
} from "antd";
import QRCode from "antd/es/qrcode";
import { Lock, QrCode, UserRound } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { invalidateCache, setAuthToken } from "@/request.ts";
import {
  fetchCurrentUser,
  type LoginParams,
  type LoginResult,
  login,
} from "@/services/auth.ts";
import { expiringStorage } from "@/utils/expiring-storage.ts";
import { settings } from "../../../config/settings.ts";

const { Title, Text } = Typography;

// 记住用户名的 localStorage key 与有效期（30 天）
const REMEMBER_KEY = "remember-username";
const REMEMBER_TTL = 30 * 24 * 60 * 60;

const Login = () => {
  const [activeTab, setActiveTab] = useState("account");
  const location = useLocation();
  const navigator = useNavigate();

  const rememberedUsername = expiringStorage.get(REMEMBER_KEY) as string | null;
  // 登录前的目标地址：优先取 URL 上的 redirect（由 401/鉴权重定向写入）
  const from = new URLSearchParams(location.search).get("redirect") || "/";
  // basename 前缀由 router 统一处理，跳转时只保留相对路由
  const relativeFrom = from.startsWith(settings.path)
    ? from.slice(settings.path.length) || "/"
    : from;
  // 防止登录后跳回登录页自身
  const target = relativeFrom.startsWith("/auth") ? "/" : relativeFrom;

  const { loading, send } = useRequest(login, {
    immediate: false, // 手动发送，提交数据
  })
    .onSuccess((event) => {
      const { token } = event.data as LoginResult;
      // 更新请求层 token 与持久化存储
      setAuthToken(token);
      try {
        localStorage.setItem("token", token);
      } catch {
        // ignore
      }
      // 清理上一会话的用户缓存，登录后重新拉取
      invalidateCache(fetchCurrentUser());
      // 登录成功后跳转回登录前的地址
      navigator(target, { replace: true });
    })
    .onError((event) => {
      message.error(event.error.message);
    });

  const onFinish = (values: LoginParams & { remember?: boolean }) => {
    if (values.remember) {
      expiringStorage.set(REMEMBER_KEY, values.username, REMEMBER_TTL);
    } else {
      expiringStorage.remove(REMEMBER_KEY);
    }
    send({ username: values.username, password: values.password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-500 to-purple-600 p-4">
      <Card className="w-full max-w-md rounded-xl shadow-2xl bg-white/90 backdrop-blur-lg">
        <div className="text-center mb-6">
          <Title level={2} className="mb-2 text-gray-800">
            Welcome Back
          </Title>
          <Text type="secondary" className="text-gray-600">
            Please enter your details to sign in
          </Text>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={[
            {
              key: "account",
              label: (
                <div className="flex items-center">
                  <UserRound size={16} className="mr-2" />
                  Account Login
                </div>
              ),
              children: (
                <Form<LoginParams & { remember?: boolean }>
                  name="login"
                  initialValues={{
                    remember: Boolean(rememberedUsername),
                    username: rememberedUsername ?? undefined,
                  }}
                  onFinish={onFinish}
                  layout="vertical"
                >
                  <Form.Item
                    label="Username"
                    name="username"
                    rules={[
                      {
                        required: true,
                        message: "Please input your Username!",
                      },
                    ]}
                  >
                    <Input
                      prefix={<UserRound className="text-gray-400" />}
                      placeholder="Enter your username"
                      size="large"
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Please input your Password!",
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={<Lock className="text-gray-400" />}
                      type="password"
                      placeholder="Enter your password"
                      size="large"
                      className="rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Flex justify="space-between" align="center">
                      <Form.Item
                        name="remember"
                        valuePropName="checked"
                        noStyle
                      >
                        <Checkbox>Remember me</Checkbox>
                      </Form.Item>
                      <Button
                        type="link"
                        className="p-0"
                        onClick={() => {
                          message.info("忘记密码请联系管理员重置");
                        }}
                      >
                        Forgot password?
                      </Button>
                    </Flex>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      block
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={loading}
                      className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 border-none font-medium hover:from-blue-600 hover:to-purple-700 rounded-lg"
                    >
                      Sign In
                    </Button>

                    <div className="text-center mt-6 text-sm">
                      <Text type="secondary">Don't have an account?</Text>{" "}
                      <Button
                        type="link"
                        className="p-0"
                        onClick={() => {
                          message.info("如需账号请联系管理员开通");
                        }}
                      >
                        Sign up
                      </Button>
                    </div>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: "qr",
              label: (
                <div className="flex items-center">
                  <QrCode size={16} className="mr-2" />
                  QR Code Login
                </div>
              ),
              children: (
                <div className="flex flex-col items-center">
                  <QRCode
                    value="vant-pro://login"
                    size={200}
                    icon="/vite.svg"
                  />
                  <div className="flex flex-col mt-4">
                    <Text strong className="text-center">
                      Scan QR code with your mobile app
                    </Text>
                    <Text type="secondary" className="text-center mt-1">
                      Open the app and scan the QR code to log in automatically
                    </Text>
                  </div>
                  <div className="mt-4">
                    <Button type="link" onClick={() => setActiveTab("account")}>
                      Use account login instead
                    </Button>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default Login;
