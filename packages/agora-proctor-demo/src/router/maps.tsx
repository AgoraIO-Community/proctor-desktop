import React from "react";
import { CreateRoom } from "../pages/create-room";
import { JoinRoom } from "../pages/join-room";
import { LaunchPage } from "../pages/launch";
import { Welcome } from "../pages/welcome";
import { HomeRouteContainer } from "./home";
import { PageRouter } from "./type";

export type AppRouteComponent = {
  path: string;
  component: React.FC;
  exact?: boolean;
};

export const routesMap: Record<string, AppRouteComponent> = {
  [PageRouter.Index]: {
    path: "/",
    component: () => <HomeRouteContainer />,
    exact: false,
  },
  [PageRouter.Welcome]: {
    path: "/",
    component: () => <Welcome />,
    exact: true,
  },
  [PageRouter.CreateRoom]: {
    path: "/create-room",
    component: () => <CreateRoom />,
    exact: true,
  },
  [PageRouter.JoinRoom]: {
    path: "/join-room",
    component: () => <JoinRoom />,
    exact: true,
  },
  [PageRouter.Launch]: {
    path: "/launch",
    component: () => <LaunchPage />,
    exact: true,
  },
};
