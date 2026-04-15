import { LandingPage } from "./pages/LandingPage";
import { UserLayout } from "./components/UserLayout";
import { AdminLayout } from "./components/AdminLayout";

// User Pages
import { UserStart } from "./pages/user/UserStart";
import { PersonalData } from "./pages/user/PersonalData";
import { VehicleData } from "./pages/user/VehicleData";
import { Payment } from "./pages/user/Payment";
import { Signature } from "./pages/user/Signature";
import { Confirmation } from "./pages/user/Confirmation";
import { LoginUser } from "./pages/user/LoginUser";
import { UserProfile } from "./pages/user/UserProfile";
import { UserFines } from "./pages/user/UserFines";
import { UserFinePayment } from "./pages/user/UserFinePayment";
import { FinesModule } from "./pages/FinesModule";

// Admin Pages
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { RegistrationDetail } from "./pages/admin/RegistrationDetail";
import { AssignFines } from "./pages/admin/AssignFines";

export const parkingRoutes = [
  {
    path: "login",
    Component: LoginUser,
  },
  {
    index: true,
    Component: LandingPage,
  },
  {
    path: "user",
    Component: UserLayout,
    children: [
      { path: "perfil", Component: UserProfile },
      { path: "multas", Component: FinesModule },
      { path: "multas/consultar", Component: UserFines },
      { path: "multas/asignar", Component: AssignFines },
      { path: "multas/pagar/:relationId", Component: UserFinePayment },
      { index: true, Component: UserStart },
      { path: "datos-personales", Component: PersonalData },
      { path: "vehiculos", Component: VehicleData },
      { path: "pago", Component: Payment },
      { path: "firma", Component: Signature },
      { path: "confirmacion", Component: Confirmation },
    ],
  },
  {
    path: "admin",
    children: [
      { index: true, Component: AdminLogin },
      {
        path: "dashboard",
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminDashboard },
          { path: "multas", Component: FinesModule },
          { path: "multas/asignar", Component: AssignFines },
          { path: "registro/:id", Component: RegistrationDetail },
        ],
      },
    ],
  },
];
