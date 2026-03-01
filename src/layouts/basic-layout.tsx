import { PageLoading, ProLayout, WaterMark } from "@ant-design/pro-components";
import type { ProLayoutProps } from "@ant-design/pro-layout";
import type { ProTokenType } from "@ant-design/pro-provider";
import { type FC, type PropsWithChildren, useRef } from "react";
import { Outlet, useSearchParams } from "react-router";
import { NavLink, useMatches } from "react-router-dom";
import { settings } from "@/config/settings.ts";
import useLoadMenu from "@/hooks/use-load-menu.ts";
import { UserContext } from "@/store/user-context.ts";

const BaseLayout: FC<PropsWithChildren> = () => {
  const matches = useMatches() as Record<any, any>;

  const [searchParams] = useSearchParams();

  const isIframe = useRef(self !== top || "1" === searchParams.get("iframe"));

  const { menus, routes, loading } = useLoadMenu();

  if (loading) {
    return <PageLoading />;
  }

  const user = matches[0].loaderData?.user || {};
  const idx = matches.length - 1;
  let showLayout: boolean | undefined;
  if (idx >= 1) {
    showLayout = matches[matches.length - 1].handle?.layout;
  }

  if (isIframe) {
    const root = document.getElementById("root");
    // 添加root样式，标识是iframe嵌入的，解决一些在iframe包裹下的样式问题
    if (root) {
      root.className = "iframe";
    }
  }

  let frameOptions: {
    logo: boolean;
    siderWidth: number;
    title?: boolean;
    token: ProTokenType["layout"];
  } = {
    logo: false,
    siderWidth: 162,
    token: {
      header: {
        colorBgHeader: "rgb(35, 47, 73)",
        colorHeaderTitle: "#FFFFFF",
        colorTextMenu: "rgba(255, 255, 255, 0.8)",
        colorTextMenuSecondary: "#FFFFFF",
        colorTextMenuSelected: "#FFFFFF",
        colorTextMenuActive: "#FFFFFF",
        colorBgMenuItemHover: "#485776",
        colorBgMenuItemSelected: "rgb(72, 87, 118)",
        colorTextRightActionsItem: "#FFFFFF",
        heightLayoutHeader: 48,
      },
      sider: {
        colorMenuBackground: "#FFFFFF",
        colorMenuItemDivider: "transparent",
      },
      pageContainer: {
        paddingBlockPageContainerContent: 0,
        paddingInlinePageContainerContent: 0,
      },
    },
  };

  const rightContent: ProLayoutProps = {
    menuFooterRender: false,
    actionsRender: false,
    avatarProps: {
      render: () => {
        return <></>;
      },
    },
  };

  const layout: ProLayoutProps["layout"] = "mix";
  if (isIframe) {
    frameOptions = {
      siderWidth: 162,
      title: false,
      logo: false,
      token: {
        header: {
          colorBgHeader: "#FFFFFF",
          colorBgMenuItemSelected: "rgba(0,0,0,0.04)",
          heightLayoutHeader: 56,
        },
        sider: {
          colorMenuBackground: "#232F49",
          colorMenuItemDivider: "transparent",
          colorBgMenuItemActive: "#232F49",
          colorBgMenuItemSelected: "#485776",
          colorBgMenuItemHover: "#232F49",
          colorBgMenuItemCollapsedElevated: "#232F49",
          colorBgCollapsedButton: "#232F49",
          colorTextCollapsedButton: "#ffffff",
          colorTextCollapsedButtonHover: "#ffffff",
          colorTextMenu: "rgba(255,255,255,0.8)",
          colorTextMenuActive: "#FFFFFF",
          colorTextMenuTitle: "rgba(255,255,255,0.8)",
          colorTextMenuSecondary: "rgba(255,255,255,0.8)",
          colorTextMenuSelected: "#FFFFFF",
          colorTextMenuItemHover: "#FFFFFF",
        },
      },
    };
  }

  let waterMark: string[] | string = "";
  const waterMarkExtra =
    window.location.origin.indexOf(".com.cn") === -1 ? "" : "【外网】";

  if (user) {
    waterMark = [user.name, "", user.account, waterMarkExtra];
  }

  return (
    <UserContext.Provider value={user}>
      <WaterMark content={waterMark} rotate={-45} zIndex={9999}>
        {showLayout === undefined ? (
          <ProLayout
            className={"task-layout"}
            splitMenus={true}
            fixSiderbar={true}
            fixedHeader={true}
            layout={layout}
            {...rightContent}
            {...frameOptions}
            title={settings.appName}
            menuData={menus}
            route={{
              path: "/",
              routes: routes,
            }}
            contentStyle={{
              paddingBlock: 12,
              paddingInline: 12,
            }}
            menuItemRender={(item, dom) => {
              // console.log("[menu][render]", item);
              if (item.path) {
                return (
                  <NavLink to={item.path} end>
                    {dom}
                  </NavLink>
                );
              }

              return dom;
            }}
          >
            <Outlet />
          </ProLayout>
        ) : (
          <Outlet />
        )}
      </WaterMark>
    </UserContext.Provider>
  );
};

export default BaseLayout;
