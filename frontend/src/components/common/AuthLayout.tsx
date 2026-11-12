import { useEffect } from "react"
import { matchPath, useLocation, Navigate, Outlet } from "react-router-dom"
import ROUTES from "@/routes/routes"
import useAuthStore from "@/store/auth.store"
import { Spinner } from "@/components/ui"
import AppLayout from "./AppLayout"




const AuthLayout = ()  => {
  const { HOME, LOGIN, CHAT, DOCS, KNOWLEDGE } = ROUTES;
  const location = useLocation();
  const { isAuthenticated, isLoading, setLoading, init } = useAuthStore((state) => state);
  const publicRoutes = [HOME.path, LOGIN.path, "/u/:token"];
  const protectedRoutes = [CHAT.path, DOCS.path, KNOWLEDGE.path];
  const isProtectedRoute = protectedRoutes.some((route) =>matchPath(route, location.pathname));
  const isPublicRoute = publicRoutes.some((route) =>matchPath(route, location.pathname));

  useEffect(()=>{
    if(!publicRoutes.includes(location.pathname)) { 
      init();
      return;
    }
    setLoading(false);
  }, [init, setLoading, location.pathname]);

  if(isLoading) return <Spinner />
  
  if (isAuthenticated && isProtectedRoute || (!isAuthenticated && isPublicRoute)) {
    return <AppLayout />;
  } else if (!isAuthenticated && isProtectedRoute) {
    return <Navigate to={HOME.path} state={{ from: location }} replace />;
  } else {
    return <Navigate to={CHAT.path}/>;
  }
}

export default AuthLayout