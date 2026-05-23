import { Suspense, lazy } from "react";
import {
  Navigate,
  Outlet,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import "./styles.scss";
import "./global.css";
import { Provider, useSelector } from "react-redux";
import store, { RootState } from "./store/index.ts";

import "./common/styles/common.scss";
import Loader from "./common/components/Loader/index.tsx";
import ProtectedRoute from "./layouts/protectedRoute.tsx";
import RoleBasedRoute from "./layouts/RoleBasedRoute.tsx";
import PortalNavigation from "./components/PortalNavigation/index.tsx";
import SeekerListDashboard from "./components/SeekerDetailsDashboard/index.tsx";
import AllSeekersList from "./components/InfinipathSeekersList/index.tsx";
import AggregatedAnalytics from "./pages/AllAnalytics/index.tsx";
import AggegrateSeekersDashboard from "./components/MeetingAnalyticsDashboardSectionsAggregate/AggegrateSeekersDashboard/index.tsx";
import FormBuilderr from "./common/components/ProgramRegistration/index.tsx";
import { YourPage } from "./pages/MyForm/index.tsx";
import ProgramCards from "./common/components/ProgramCards/index.tsx";
import ChooseProgramPage from "./pages/pages/ChooseProgram/ChooseProgramPage.tsx";
import ChooseTemplatePage from "./pages/pages/ChooseTemplate/ChooseTemplatePage.tsx";
import AddProgramPage from "./pages/pages/AddProgramPage.tsx";
import Index from "./pages/pages/Index.tsx";
import SuccessScreen from "./components/SuccessScreenPage/index.tsx";
import FormBuilderEdit from "./components/FormBuilderEdit/index.tsx";
import InfiniPrayer from "./pages/InfiniPrayer/index.tsx";
import { DEFINED_ROLES, textConstant, CSS_CLASSES } from "./constants/textConstants.ts";
import { INFINIPATH } from "./constants/urlConstants.ts";
import HdbSeekersListAdmin from "./pages/HdbSeekersListAdmin/index.tsx";
import DashboardLayout from "./pages/HDBDashboardLayout/index.tsx";
import { DashboardProvider } from "./context/HDBDashboardContext.tsx";
import { ToastContainer } from "react-toastify";
const Header = lazy(() => import("./common/Header/index"));
const Subheader = lazy(() => import("./common/Subheader/index.tsx"));
const LoginScreen = lazy(() => import("./pages/LoginScreen/index.tsx"));
const CreateMeeting = lazy(() => import("./pages/CreateMeeting/index.tsx"));
const TrackRegistrations = lazy(
  () => import("./pages/TrackNmanageRegistrations"),
);
const Zoom = lazy(() => import("./pages/Zoom/index.tsx"));
const VerifyUserFace = lazy(() => import("./pages/VerifyUserFace/index.tsx"));
const Profile = lazy(() => import("./pages/Profile/index.tsx"));
const Redirect = lazy(() => import("./pages/Redirect/index.tsx"));
const MuiDataGrid = lazy(() => import("./pages/SeerkersList/index.tsx"));
const UploadGrid = lazy(() => import("./pages/UploadTable/index.tsx"));
const Unathorized = lazy(() => import("./pages/Unathorized/index.tsx"));
const ViewAnalytics = lazy(() => import("./pages/Analytics/index.tsx"));
const SeekerAnalytics = lazy(
  () => import("./components/SeekerAnalytics/index.tsx"),
);
const QuestionsList = lazy(() => import("./pages/QuestionsList/index.tsx"));
const OptionsList = lazy(() => import("./pages/OptionsList/index.tsx"));
const FormBuilder = lazy(() => import("./pages/FormBuilder/index.tsx"));
const ProgramNameCards = lazy(
  () => import("./common/components/ProgramNameCards/index.tsx"),
);
const ActionCards = lazy(() => import("./components/ActionCards/index.tsx"));
const PreviewForm = lazy(() => import("./pages/pages/PreviewForm/index.tsx"));
const SeekersAllocations = lazy(
  () => import("./components/SeatApprovalFlow/SeekerApproval/index.tsx"),
);

const ListOfTheProgram = lazy(
  () => import("./components/ActionCards/ListOfMeetings/index.tsx"),
);

const SeekerInnerCircle = lazy(
  () => import("./common/components/SeekersFriendsFamily/index.tsx"),
);
const DifferPrograms = lazy(
  () => import("./components/AllProgramsList/DifferPrograms/index.tsx"),
);

const RegisteredSeekerDetails = lazy(
  () => import("./pages/RegisteredSeekersDetails/index.tsx"),
);

interface AppLayoutProps {
  type: string;
}

//App layout to render the nested routes with a subheader component
const AppLayout: React.FC<AppLayoutProps> = () => {
  const location = useLocation();
  const selectedSideNav = useSelector((state: RootState) => state?.seekerReducer?.sideNavId || "");
  return (
    <>
      <div className="layoutContainer">
        <PortalNavigation />
        <div
          className={
            CSS_CLASSES.CONTENT_CONTAINER +
            (selectedSideNav === INFINIPATH ? ` ${CSS_CLASSES.CONTENT_CONTAINER_WITH_SIDEBAR}` : "") +
            (location.pathname.includes(textConstant.SEAT_ALLOCATIONS) ? ` ${CSS_CLASSES.MAHATRIA_FLOW_BG}` : "")
          }
        >
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default function App() {
   const selectedSideNav = useSelector(
      (state: RootState) => state?.seekerReducer?.sideNavId || "",
    );
   const largeLoaderCount = useSelector(
      (state: RootState) => state?.ProgramReducer?.loaderCounts?.largeLoaderCount || 0,
    );

  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Suspense fallback={<Loader type="large" />}>
            <Header />
            { selectedSideNav === INFINIPATH && <Subheader/>}
            <ToastContainer />
            {largeLoaderCount > 0 && <Loader type="large" />}
            <div>
              <Routes>
                <Route path="/" element={<LoginScreen />} />
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/verifyuserface" element={<VerifyUserFace />} />
                <Route element={<ProtectedRoute />}>
                  {/* Routes for Admin starts here */}
                  <Route
                    path="/admin"
                    element={
                      <RoleBasedRoute
                        element={<AppLayout type="admin" />}
                        allowedRoles={DEFINED_ROLES}
                      />
                    }
                  >
                    <Route
                      path=""
                      element={<Navigate to="/admin/infinipath/sessions" />}
                    />
                    <Route
                      path="home"
                      element={<Navigate to="/admin/infinipath/sessions" replace />}
                    />
                    
                    {/* Infinipath Routes */}
                    <Route path="infinipath">
                      <Route
                        path="createinfinipath"
                        element={<CreateMeeting />}
                      />
                      <Route
                        path="session-analytics"
                        element={<ViewAnalytics />}
                      />
                      <Route
                        path="seekers-analytics/:userId"
                        element={<SeekerAnalytics />}
                      />
                      <Route
                        path="aggregate-analytics"
                        element={<AggregatedAnalytics />}
                      />
                      <Route
                        path="session-analytics/seeker-details"
                        element={<SeekerListDashboard />}
                      />
                      <Route
                        path="aggregate-analytics/seeker-details"
                        element={<AggegrateSeekersDashboard />}
                      />
                      <Route
                        path="seeker-analytics-details"
                        element={<SeekerInnerCircle />}
                      />
                      <Route path="sessions" element={<TrackRegistrations />} />
                      <Route
                        path="session-seeker-list"
                        element={<MuiDataGrid />}
                      />
                      <Route path="seekers" element={<AllSeekersList />} />
                    </Route>
                    
                    {/* Common/Shared Routes */}
                    <Route path="uploadTable" element={<UploadGrid />} />
                    <Route path="zoom" element={<Zoom />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="redirect" element={<Redirect />} />
                    <Route path="questionslist" element={<QuestionsList />} />
                    <Route path="optionsList" element={<OptionsList />} />
                    <Route path="program-reg" element={<FormBuilderr />} />
                    <Route
                      path="program-name-cards"
                      element={<ProgramNameCards />}
                    />
                    <Route path="program-cards" element={<ProgramCards />} />
                    <Route path="action-cards" element={<ActionCards />} />
                    <Route
                      path="action-cards/registered/seeker-details/:seekerId/:programId"
                      element={<RegisteredSeekerDetails />}
                    />
                    <Route
                      path="list-of-programs"
                      element={<ListOfTheProgram programsList={{ programs: [] }} />}
                    />
                    <Route path="formbuilder" element={<FormBuilder />} />
                    <Route
                      path="choose-program"
                      element={<ChooseProgramPage onBack={() => {}} />}
                    />
                    <Route
                      path="choose-template"
                      element={<ChooseTemplatePage />}
                    />
                    <Route
                      path="/admin/add-program"
                      element={<AddProgramPage />}
                    />
                    <Route
                      path="/admin/add-program/:programId"
                      element={<AddProgramPage />}
                    />
                    <Route path="program-dashboard" element={<Index />} />
                    <Route path="program-success" element={<SuccessScreen />} />
                    <Route path="program-edit" element={<FormBuilderEdit />} />
                    <Route path="preview-form" element={<PreviewForm />} />
                    <Route
                      path="seeker-dashboard"
                      element={<DifferPrograms />}
                    />
                    {/* Add entertainment route if needed */}
                    <Route path="entrainment" element={<DifferPrograms />} />
                    <Route path="tat-online" element={<DifferPrograms />} />
                    <Route
                      path="seat-allocations/:programId"
                      element={<SeekersAllocations />}
                    />
                    <Route path="infiniprayer" element={<InfiniPrayer />} />
                    <Route
                      path="hdb-dashboard/:programId"
                      element={
                        <DashboardProvider>
                          <DashboardLayout />
                        </DashboardProvider>
                      }
                    />
                    <Route
                      path="hdb-dashboard/:programId/:sessionId"
                      element={<HdbSeekersListAdmin />}
                    />
                  </Route>
                  <Route path="my-form" element={<YourPage />} />
                  {/* Routes for Admin ends here */}
                </Route>
                <Route path="*" element={<LoginScreen />} />
                <Route path="/unauthorized" element={<Unathorized />} />
              </Routes>
            </div>
          </Suspense>
        </div>
      </Router>
    </Provider>
  );
}
