import { fetch } from "@/request.tsx";

export type CurrentUser = {
  uid: string;
  nickname: string;
  avatar: string;
};

export const fetchCurrentUser = () => {
  return fetch<CurrentUser>("/api/current", {});
};
