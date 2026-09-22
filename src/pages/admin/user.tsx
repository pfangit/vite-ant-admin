import {
  type ActionType,
  ModalForm,
  type ProColumns,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProTable,
} from "@ant-design/pro-components";
import { useRequest } from "alova/client";
import { Button, message, Popconfirm, Tag } from "antd";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth.ts";
import {
  createUser,
  deleteUser,
  fetchUsers,
  type UserFormData,
  type UserItem,
  type UserStatus,
  updateUser,
} from "@/services/admin.ts";

const statusEnum = {
  active: { text: "启用", status: "Success" },
  disabled: { text: "禁用", status: "Error" },
} as const;

const roleEnum = {
  admin: { text: "管理员" },
  editor: { text: "编辑" },
  viewer: { text: "访客" },
} as const;

const roleOptions = Object.entries(roleEnum).map(([value, { text }]) => ({
  value,
  label: text,
}));

const statusOptions = Object.entries(statusEnum).map(([value, { text }]) => ({
  value,
  label: text,
}));

const UserPage = () => {
  const { hasAuth } = useAuth();
  const actionRef = useRef<ActionType>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // 新增/编辑共用
  const { send: submit } = useRequest(
    (payload: { id?: string; values: UserFormData }) =>
      payload.id
        ? updateUser(payload.id, payload.values)
        : createUser(payload.values),
    { immediate: false },
  )
    .onSuccess(() => {
      message.success("保存成功");
      setModalOpen(false);
      actionRef.current?.reload();
    })
    .onError((event) => {
      message.error(event.error.message);
    });

  // 删除
  const { send: remove } = useRequest((id: string) => deleteUser(id), {
    immediate: false,
  })
    .onSuccess(() => {
      message.success("删除成功");
      actionRef.current?.reload();
    })
    .onError((event) => {
      message.error(event.error.message);
    });

  const openCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const openEdit = (record: UserItem) => {
    setEditingUser(record);
    setModalOpen(true);
  };

  const columns: ProColumns<UserItem>[] = [
    { title: "ID", dataIndex: "id", search: false, width: 90 },
    { title: "姓名", dataIndex: "name" },
    { title: "邮箱", dataIndex: "email", search: false },
    { title: "手机", dataIndex: "phone", search: false },
    {
      title: "角色",
      dataIndex: "role",
      valueType: "select",
      valueEnum: roleEnum,
      search: false,
    },
    {
      title: "状态",
      dataIndex: "status",
      valueType: "select",
      valueEnum: statusEnum,
      render: (_, record) => (
        <Tag color={record.status === "active" ? "success" : "error"}>
          {statusEnum[record.status].text}
        </Tag>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      search: false,
      render: (_, record) => new Date(record.createdAt).toLocaleString(),
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      fixed: "right",
      width: 160,
      render: (_, record) => [
        hasAuth("user:edit") ? (
          <Button
            key="edit"
            type="link"
            size="small"
            className="p-0"
            onClick={() => {
              openEdit(record);
            }}
          >
            编辑
          </Button>
        ) : null,
        hasAuth("user:delete") ? (
          <Popconfirm
            key="delete"
            title="确定删除该用户吗？"
            onConfirm={() => remove(record.id)}
          >
            <Button type="link" size="small" danger className="p-0">
              删除
            </Button>
          </Popconfirm>
        ) : null,
      ],
    },
  ];

  return (
    <ProTable<UserItem>
      actionRef={actionRef}
      rowKey="id"
      headerTitle="用户管理"
      columns={columns}
      search={{
        labelWidth: "auto",
      }}
      toolBarRender={() => [
        <Button
          key="create"
          type="primary"
          icon={<Plus size={16} />}
          disabled={!hasAuth("user:add")}
          onClick={openCreate}
        >
          新增用户
        </Button>,
      ]}
      request={async (params) => {
        const res = await fetchUsers({
          pageNum: params.current ?? 1,
          pageSize: params.pageSize ?? 10,
          name: params.name,
          status: (params.status as UserStatus | undefined) ?? undefined,
        });
        return { data: res.list, total: res.total, success: true };
      }}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
      }}
    >
      <ModalForm<UserFormData>
        title={editingUser ? "编辑用户" : "新增用户"}
        width={480}
        open={modalOpen}
        onOpenChange={setModalOpen}
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
        }}
        initialValues={
          editingUser ?? { role: "viewer", status: "active" as UserStatus }
        }
        onFinish={async (values) => {
          await submit({ id: editingUser?.id, values });
          // 校验通过即关闭（submit 内部通过 message 反馈成败）
          return true;
        }}
      >
        <ProFormText
          name="name"
          label="姓名"
          rules={[{ required: true, message: "请输入姓名" }]}
        />
        <ProFormText
          name="email"
          label="邮箱"
          rules={[
            { required: true, type: "email", message: "请输入正确的邮箱" },
          ]}
        />
        <ProFormText name="phone" label="手机号" />
        <ProFormSelect
          name="role"
          label="角色"
          options={roleOptions}
          rules={[{ required: true, message: "请选择角色" }]}
        />
        <ProFormRadio.Group
          name="status"
          label="状态"
          options={statusOptions}
          rules={[{ required: true, message: "请选择状态" }]}
        />
      </ModalForm>
    </ProTable>
  );
};

export default UserPage;
