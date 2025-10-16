import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("api/chat", "routes/api.chat.ts"),
  route("api/associations", "routes/api.associations.ts"),
  route("api/nodes/delete", "routes/api.nodes.delete.ts"),
  route("api/nodes/clear", "routes/api.nodes.clear.ts")
] satisfies RouteConfig;
