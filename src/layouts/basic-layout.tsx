import { ProConfigProvider, ProLayout } from "@ant-design/pro-components";
import { ConfigProvider, Dropdown } from "antd";
import { InfoIcon, LogOutIcon, ShieldQuestion } from "lucide-react";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import routes from "@/config/routes.ts";
import { settings } from "@/config/settings.ts";
import { useCurrentUser } from "@/hooks/use-current-user.ts";
import { useMenus } from "@/hooks/use-menus.ts";
import type { CurrentUser } from "@/services/auth.ts";

const BasicLayout = () => {
  const location = useLocation();

  const [pathname, setPathname] = useState(location.pathname);

  const { user } = useCurrentUser();
  const { menus, loading } = useMenus();

  const authedUser: CurrentUser | Record<string, any> = user || {};

  if (loading) {
    return <div>Loading...</div>;
  }

  if (typeof document === "undefined") {
    return <div />;
  }

  console.log(user, menus);

  return (
    <div
      style={{
        height: "100vh",
        overflow: "auto",
      }}
    >
      <ProConfigProvider hashed={false}>
        <ConfigProvider
          getTargetContainer={() => {
            return document.getElementById("test-pro-layout") || document.body;
          }}
        >
          <ProLayout
            title={settings.appName}
            logo={false}
            location={{
              pathname,
            }}
            token={{
              header: {
                colorBgMenuItemSelected: "rgba(0,0,0,0.04)",
              },
            }}
            siderMenuType="group"
            layout="mix"
            splitMenus={true}
            menu={{
              collapsedShowGroupTitle: true,
              request: async () => {
                return menus || [];
              },
            }}
            route={{
              path: "/",
              children: routes,
            }}
            avatarProps={{
              src: authedUser.avatar,
              size: "small",
              title: authedUser.nickname,
              render: (_props, dom) => {
                return (
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "logout",
                          icon: <LogOutIcon />,
                          label: "退出登录",
                        },
                      ],
                    }}
                  >
                    {dom}
                  </Dropdown>
                );
              },
            }}
            actionsRender={(props) => {
              if (props.isMobile || typeof window === "undefined") {
                return [];
              }

              return [
                <InfoIcon size={36} key="info" />,
                <ShieldQuestion size={36} key="question" />,
              ];
            }}
            headerTitleRender={(logo, title, _) => {
              const defaultDom = (
                <a>
                  {logo}
                  {title}
                </a>
              );

              return defaultDom;
            }}
            footerRender={() => {
              return (
                <div
                  style={{
                    textAlign: "center",
                    paddingBlockStart: 12,
                  }}
                >
                  <div>© 2025 Vite Ant Design</div>
                </div>
              );
            }}
            onMenuHeaderClick={(e) => console.log(e)}
            menuItemRender={(item, dom) => (
              <div
                onClick={() => {
                  setPathname(item.path || "/welcome");
                }}
              >
                {dom}
              </div>
            )}
            {...settings}
          >
            <Outlet />
          </ProLayout>
        </ConfigProvider>
      </ProConfigProvider>{" "}
    </div>
  );
};

export default BasicLayout;
