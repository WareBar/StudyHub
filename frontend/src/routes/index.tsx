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
import MyGroupsPage from "@/pages/GroupsPage/MyGroups";
import { SessionVideoRoom } from "@/pages/hub/session-video-room";
import { NotFound } from "@/pages/errors/not-found";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route index element={<HomePage />} />

      {/* For not logged in users */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* For logged in users only */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/groups" element={<GroupsFinderPage />} />
        <Route path="/my-groups" element={<MyGroupsPage/>}/>
        <Route path="/groups/:id" element={<GroupDetailsPage />}/>
        <Route path="/groups/:id/session_video_room/:groupId/:sessionId" element={<SessionVideoRoom/>}/>
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        {/* <Route path="/session_video_room/:groupId/:sessionId" element={<SessionVideoRoom/>}/> */}
        {/* <Route path="/classroom" element={<ClassroomPage/>}/> */}
      </Route>

      <Route path="*" element={<NotFound/>}/>
    </>,
  ),
);
