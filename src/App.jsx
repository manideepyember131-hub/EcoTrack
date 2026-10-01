import { BrowserRouter, Routes, Route } from "react-router-dom";


// Citizen Pages
import MyComplaints from "./pages/citizen/MyComplaints";
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import ReportWaste from "./pages/citizen/ReportWaste";
import WasteCollection from "./pages/citizen/WasteCollection";
import RecyclingCenters from "./pages/citizen/RecyclingCenters";
import CommunityActivities from "./pages/citizen/CommunityActivities";
import TreePlanting from "./pages/citizen/TreePlanting";
import MyContributions from "./pages/citizen/MyContributions";
import Notifications from "./pages/citizen/Notifications";
import Profile from "./pages/citizen/Profile";

// Worker Pages
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import AssignedTasks from "./pages/worker/AssignedTasks";
import TaskDetails from "./pages/worker/TaskDetails";
import WorkerProfile from "./pages/worker/WorkerProfile";

// Authentication Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Public Pages
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Features from "./pages/public/Features";
import Careers from "./pages/public/Careers";
import Contact from "./pages/public/Contact";
import Gallery from "./pages/public/Gallery";
import Services from "./pages/public/Services";
function App() {
  return (

      <BrowserRouter>
        <Routes>

          {/* =========================================
              PUBLIC
          ========================================= */}

          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/services" element={<Services />} />

          {/* =========================================
              AUTHENTICATION
          ========================================= */}

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />


          {/* =========================================
              CITIZEN
          ========================================= */}

          <Route
            path="/citizen"
            element={<CitizenDashboard />}
          />

          <Route
            path="/report-waste"
            element={<ReportWaste />}
          />

          <Route
            path="/my-complaints"
            element={<MyComplaints />}
          />

          <Route
            path="/waste-collection"
            element={<WasteCollection />}
          />

          <Route
            path="/recycling-centers"
            element={<RecyclingCenters />}
          />

          <Route
            path="/community-activities"
            element={<CommunityActivities />}
          />

          <Route
            path="/tree-planting"
            element={<TreePlanting />}
          />

          <Route
            path="/my-contributions"
            element={<MyContributions />}
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />


          {/* =========================================
              WORKER
          ========================================= */}

          <Route
            path="/worker-dashboard"
            element={<WorkerDashboard />}
          />

          <Route
            path="/assigned-tasks"
            element={<AssignedTasks />}
          />

          <Route
            path="/task-details/:id"
            element={<TaskDetails />}
          />

          <Route
            path="/todays-tasks"
            element={<AssignedTasks />}
          />

          <Route
            path="/completed-tasks"
            element={<AssignedTasks />}
          />

          <Route
            path="/worker-profile"
            element={<WorkerProfile />}
          />

        </Routes>
      </BrowserRouter>
  );
}

export default App;