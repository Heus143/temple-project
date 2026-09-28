import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";

import PublicLayout from "@/components/PublicLayout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Gallery from "@/pages/Gallery";
import PreviousYears from "@/pages/PreviousYears";
import Events from "@/pages/Events";
import Committee from "@/pages/Committee";
import Vamshavali from "@/pages/Vamshavali";
import Location from "@/pages/Location";
import Contact from "@/pages/Contact";
import { ForgotPassword, ResetPassword } from "@/pages/Auth";

import AdminLogin from "@/admin/AdminLogin";
import AdminLayout from "@/admin/AdminLayout";
import Dashboard from "@/admin/Dashboard";
import AdminTemple from "@/admin/AdminTemple";
import AdminHome from "@/admin/AdminHome";
import AdminAbout from "@/admin/AdminAbout";
import AdminGallery from "@/admin/AdminGallery";
import AdminEvents from "@/admin/AdminEvents";
import AdminPreviousYears from "@/admin/AdminPreviousYears";
import AdminCommittee from "@/admin/AdminCommittee";
import AdminVamshavali from "@/admin/AdminVamshavali";
import AdminAnnouncements from "@/admin/AdminAnnouncements";
import AdminLocation from "@/admin/AdminLocation";
import AdminContact from "@/admin/AdminContact";
import AdminMedia from "@/admin/AdminMedia";
import AdminSettings from "@/admin/AdminSettings";

const pub = (el) => <PublicLayout>{el}</PublicLayout>;
const adm = (el) => <AdminLayout>{el}</AdminLayout>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" richColors />
        <Routes>
          <Route path="/" element={pub(<Home />)} />
          <Route path="/about" element={pub(<About />)} />
          <Route path="/gallery" element={pub(<Gallery />)} />
          <Route path="/previous-years" element={pub(<PreviousYears />)} />
          <Route path="/events" element={pub(<Events />)} />
          <Route path="/committee" element={pub(<Committee />)} />
          <Route path="/vamshavali" element={pub(<Vamshavali />)} />
          <Route path="/location" element={pub(<Location />)} />
          <Route path="/contact" element={pub(<Contact />)} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={adm(<Dashboard />)} />
          <Route path="/admin/temple" element={adm(<AdminTemple />)} />
          <Route path="/admin/home" element={adm(<AdminHome />)} />
          <Route path="/admin/about" element={adm(<AdminAbout />)} />
          <Route path="/admin/gallery" element={adm(<AdminGallery />)} />
          <Route path="/admin/events" element={adm(<AdminEvents />)} />
          <Route path="/admin/previous-years" element={adm(<AdminPreviousYears />)} />
          <Route path="/admin/committee" element={adm(<AdminCommittee />)} />
          <Route path="/admin/vamshavali" element={adm(<AdminVamshavali />)} />
          <Route path="/admin/announcements" element={adm(<AdminAnnouncements />)} />
          <Route path="/admin/location" element={adm(<AdminLocation />)} />
          <Route path="/admin/contact" element={adm(<AdminContact />)} />
          <Route path="/admin/media" element={adm(<AdminMedia />)} />
          <Route path="/admin/settings" element={adm(<AdminSettings />)} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
