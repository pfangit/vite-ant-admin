import {
  PageLoading,
  ProLayout,
  type ProLayoutProps,
  type ProTokenType,
  WaterMark,
} from "@ant-design/pro-components";
import { useRequest } from "alova/client";
import { type FC, type PropsWithChildren, useRef } from "react";
import { Outlet, useSearchParams } from "react-router";
import { NavLink } from "react-router-dom";
import useLoadMenu from "@/hooks/use-load-menu.ts";
import { fetchCurrentUser } from "@/services/auth.ts";
import { UserContext } from "@/store/user-context.ts";
import { settings } from "../../config/settings.ts";

const BaseLayout: FC<PropsWithChildren> = () => {
  const [searchParams] = useSearchParams();

  const isIframe = useRef(self !== top || "1" === searchParams.get("iframe"));

  const { menus, routes, loading } = useLoadMenu();
  const { data: currentUser } = useRequest(fetchCurrentUser(), {
    initialData: undefined,
  });

  if (loading) {
    return <PageLoading>菜单加载中...</PageLoading>;
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
        return <>right content</>;
      },
    },
  };

  const layout: ProLayoutProps["layout"] = "mix";

  if (isIframe.current) {
    const root = document.getElementById("root");
    // 添加root样式，标识是iframe嵌入的，解决一些在iframe包裹下的样式问题
    if (root) {
      root.className = "iframe";
    }

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
          colorMenuBackground: "#FFFFFF",
          colorTextCollapsedButton: "#232F49",
          colorTextCollapsedButtonHover: "#232F49",
          colorTextMenu: "#232F49",
          colorTextMenuActive: "#232F49",
          colorTextMenuTitle: "#232F49",
          colorTextMenuSecondary: "#232F49",
          colorTextMenuSelected: "#232F49",
          colorTextMenuItemHover: "#232F49",
        },
      },
    };
  }

  let waterMark: string[] | string = "";

  if (currentUser?.nickname) {
    waterMark = [`${currentUser.nickname}`];
  }

  return (
    <UserContext.Provider value={currentUser ?? null}>
      <WaterMark content={waterMark} rotate={-45} zIndex={9999}>
        <ProLayout
          className={"basic-layout"}
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
            if (item.path) {
              return (
                <NavLink to={item.path.substring(settings.path.length)} end>
                  {dom}
                </NavLink>
              );
            }

            return dom;
          }}
        >
          <Outlet />
        </ProLayout>
      </WaterMark>
    </UserContext.Provider>
  );
};

export default BaseLayout;
