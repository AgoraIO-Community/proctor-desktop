import React from "react";
import { ColorPage } from "../pages/color";
import { HomePage } from "../pages/home";
import { LaunchPage } from "../pages/launch";
import { BizPageRouter } from "./type";

export type AppRouteComponent = {
  path: string;
  component: React.FC;
};

export const routesMap: Record<string, AppRouteComponent> = {
  [BizPageRouter.HomePage]: {
    path: "/",
    component: () => <HomePage />,
  },
  [BizPageRouter.LaunchPage]: {
    path: "/launch",
    component: () => <LaunchPage />,
  },
  [BizPageRouter.ColorPage]: {
    path: "/color",
    component: () => <ColorPage />,
  },
};
