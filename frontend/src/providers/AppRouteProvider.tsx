import { RouterProvider, createBrowserRouter } from "react-router-dom";
import appRoutes from "@/routes/AppRoutes";

export default function AppRouteProvider(){
  return (
    <RouterProvider router={createBrowserRouter(appRoutes)} />
  )
}