import { createBrowserRouter } from "react-router";
import NewHome from "./pages/NewHome";
import GameStyleCase from "./pages/GameStyleCase";
import FinalResults from "./pages/FinalResults";
import AdminPanel from "./pages/AdminPanel";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: NewHome,
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
    path: "/admin",
    Component: AdminPanel,
  },
]);
