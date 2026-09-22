import type { UserFormData, UserItem, UserStatus } from "../src/services/admin";

const roles = ["admin", "editor", "viewer"];

let seed = 0;
const now = Date.now();
const db: UserItem[] = Array.from({ length: 43 }, (_, i) => {
  seed += 1;
  const status: UserStatus = i % 4 === 0 ? "disabled" : "active";
  return {
    id: `100${seed}`,
    name: `用户${seed}`,
    email: `user${seed}@example.com`,
    phone: `1380000${String(seed).padStart(4, "0")}`,
    role: roles[seed % roles.length],
    status,
    createdAt: new Date(now - seed * 86_400_000).toISOString(),
  };
});

let uid = seed;
const nextId = () => {
  uid += 1;
  return `100${uid}`;
};

export default [
  {
    url: "/api/users",
    method: "get",
    response: ({
      query,
    }: {
      query?: {
        pageNum?: string;
        pageSize?: string;
        name?: string;
        status?: string;
      };
    }) => {
      const {
        pageNum = "1",
        pageSize = "10",
        name = "",
        status = "",
      } = query ?? {};
      const safePage = Math.max(parseInt(pageNum, 10) || 1, 1);
      const safeSize = Math.max(Math.min(parseInt(pageSize, 10) || 10, 100), 1);
      const filtered = db.filter((item) => {
        const matchedName = name ? item.name.includes(name) : true;
        const matchedStatus = status ? item.status === status : true;
        return matchedName && matchedStatus;
      });
      const start = (safePage - 1) * safeSize;
      return {
        code: 0,
        message: "",
        data: {
          list: filtered.slice(start, start + safeSize),
          total: filtered.length,
        },
        success: true,
      };
    },
  },
  {
    url: "/api/users",
    method: "post",
    response: ({ body }: { body?: UserFormData }) => {
      const data = body ?? {};
      if (!data.name || !data.email) {
        return { code: 2001, message: "姓名和邮箱不能为空", success: false };
      }
      const item: UserItem = {
        id: nextId(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role || "viewer",
        status: data.status ?? "active",
        createdAt: new Date().toISOString(),
      };
      db.unshift(item);
      return { code: 0, message: "", data: item, success: true };
    },
  },
  {
    url: /\/api\/users\/\d+/,
    method: "put",
    response: ({ url, body }: { url: string; body?: UserFormData }) => {
      const id = url.split("/").pop() ?? "";
      const index = db.findIndex((item) => item.id === id);
      if (index < 0) {
        return { code: 2002, message: "用户不存在", success: false };
      }
      const data = body ?? {};
      db[index] = { ...db[index], ...data };
      return { code: 0, message: "", data: db[index], success: true };
    },
  },
  {
    url: /\/api\/users\/\d+/,
    method: "delete",
    response: ({ url }: { url: string }) => {
      const id = url.split("/").pop() ?? "";
      const index = db.findIndex((item) => item.id === id);
      if (index < 0) {
        return { code: 2002, message: "用户不存在", success: false };
      }
      db.splice(index, 1);
      return { code: 0, message: "", success: true };
    },
  },
];
