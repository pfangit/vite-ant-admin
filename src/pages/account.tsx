import { useRequest } from "alova/client";
import { Button, Card, Descriptions, Form, Input, message, Tag } from "antd";
import { Lock, UserRound } from "lucide-react";
import type { ChangePasswordParams } from "@/services/auth.ts";
import { changePassword } from "@/services/auth.ts";
import { useAuthStore } from "@/store/auth.ts";

const AccountPage = () => {
  const user = useAuthStore((state) => state.user);

  const { loading, send } = useRequest(
    (params: ChangePasswordParams) => changePassword(params),
    { immediate: false },
  )
    .onSuccess(() => {
      message.success("密码修改成功");
    })
    .onError((event) => {
      message.error(event.error.message);
    });

  return (
    <div className="max-w-3xl space-y-4">
      <Card title="个人资料">
        <div className="flex items-center gap-4 mb-4">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.nickname}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <UserRound size={56} className="text-gray-300" />
          )}
          <div>
            <div className="text-lg font-medium">{user?.nickname ?? "-"}</div>
            <div className="text-gray-400 text-sm">UID: {user?.uid ?? "-"}</div>
          </div>
        </div>
        <Descriptions column={1}>
          <Descriptions.Item label="角色">
            {(user?.roles ?? []).map((role) => (
              <Tag key={role} color="blue">
                {role}
              </Tag>
            ))}
          </Descriptions.Item>
          <Descriptions.Item label="权限码">
            {(user?.permissions ?? []).join("、") || "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="修改密码">
        <Form<ChangePasswordParams>
          name="change-password"
          layout="vertical"
          className="max-w-md"
          onFinish={(values) => send(values)}
        >
          <Form.Item
            label="原密码"
            name="oldPassword"
            rules={[{ required: true, message: "请输入原密码" }]}
          >
            <Input.Password prefix={<Lock size={14} />} />
          </Form.Item>
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: "请输入新密码" },
              { min: 6, message: "新密码长度不少于 6 位" },
            ]}
          >
            <Input.Password prefix={<Lock size={14} />} />
          </Form.Item>
          <Form.Item
            label="确认新密码"
            name="confirm"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "请再次输入新密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                },
              }),
            ]}
          >
            <Input.Password prefix={<Lock size={14} />} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AccountPage;
