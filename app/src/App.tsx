import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './App.css';

import PublicLayout from '@/components/layout/PublicLayout';
import ProtectedAdminRoute from '@/components/routes/ProtectedAdminRoute';
import ProtectedMemberRoute from '@/components/routes/ProtectedMemberRoute';
import ScrollToTop from '@/components/routes/ScrollToTop';

import Home from '@/pages/Home';
import About from '@/pages/About';
import Schedule from '@/pages/Schedule';
import Rules from '@/pages/Rules';
import Contact from '@/pages/Contact';
import Gallery from '@/pages/Gallery';
import Registration from '@/pages/Registration';
import Shop from '@/pages/Shop';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminEntry from '@/pages/admin/AdminEntry';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import MembersLogin from '@/pages/members/MembersLogin';
import MembersRegister from '@/pages/members/MembersRegister';
import MembersDashboard from '@/pages/members/MembersDashboard';

gsap.registerPlugin(ScrollTrigger);

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/shop" element={<Shop />} />
          <Route
            path="/members/dashboard"
            element={
              <ProtectedMemberRoute>
                <MembersDashboard />
              </ProtectedMemberRoute>
            }
          />
        </Route>

        <Route path="/members/login" element={<MembersLogin />} />
        <Route path="/members/register" element={<MembersRegister />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminEntry />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
