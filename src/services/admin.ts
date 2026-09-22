import { http } from "@/request.ts";

export type UserStatus = "active" | "disabled";

export type UserItem = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: UserStatus;
  createdAt: string;
};

export type UserQuery = {
  pageNum: number;
  pageSize: number;
  name?: string;
  status?: UserStatus;
};

export type PageResult<T> = {
  list: T[];
  total: number;
};

export type UserFormData = {
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: UserStatus;
};

export const fetchUsers = (params: UserQuery) =>
  http.get<PageResult<UserItem>>("/api/users", { params });

export const createUser = (data: UserFormData) =>
  http.post<UserItem>("/api/users", data);

export const updateUser = (id: string, data: UserFormData) =>
  http.put<UserItem>(`/api/users/${id}`, data);

export const deleteUser = (id: string) => http.delete<null>(`/api/users/${id}`);
