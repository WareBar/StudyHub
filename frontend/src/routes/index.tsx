import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import LoginPage from "@/pages/auth/login";
import SignupPage from "@/pages/auth/register";
import HomePage from "@/pages/landing";
import DashboardPage from "@/pages/dashboard";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import GroupsFinderPage from "@/pages/GroupsPage";
import SchedulePage from "@/pages/SchedulePage";
import ProfilePage from "@/pages/profile";
import GroupDetailsPage from "@/pages/GroupsPage/GroupDetailsPage";
import ClassroomPage from "@/pages/hub/classroom-page";


export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route index element={<HomePage />} />

      {/* For not logged in users */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>
        <Route path="/classroom" element={<ClassroomPage/>}/>

      {/* For logged in users only */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/groups" element={<GroupsFinderPage />} />
        <Route path="/groups/:id" element={<GroupDetailsPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        {/* <Route path="/classroom" element={<ClassroomPage/>}/> */}
      </Route>
    </>,
  ),
);
