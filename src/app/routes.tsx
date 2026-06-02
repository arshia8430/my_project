import { createBrowserRouter, Navigate } from "react-router";
import NewHome from "./pages/NewHome";
import GameStyleCase from "./pages/GameStyleCase";
import FinalResults from "./pages/FinalResults";
import AdminPanel from "./pages/AdminPanel";
import AdminLogin from "./pages/AdminLogin";
import RouteError from "./pages/RouteError";
import { isAdminAuthenticated } from "./utils/adminAuth";

function ProtectedAdmin() {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <AdminPanel />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: NewHome,
    errorElement: <RouteError />,
  },
  {
    path: "/case/:caseId",
    Component: GameStyleCase,
  },
  {
    path: "/final-results",
    Component: FinalResults,
  },
  {
    path: "/admin/login",
    Component: AdminLogin,
  },
  {
    path: "/admin",
    Component: ProtectedAdmin,
  },
  {
    path: "*",
    Component: RouteError,
  },
]);
