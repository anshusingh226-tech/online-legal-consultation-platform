import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { MyAppointmentsPage } from "./pages/MyAppointmentsPage";
import { ClientDashboardPage } from "./pages/ClientDashboardPage";
import { LawyerDashboardPage } from "./pages/LawyerDashboardPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { LawyerProfileModal } from "./components/LawyerProfileModal";
import { ConsultationRoomModal } from "./components/ConsultationRoomModal";
import { ReviewModal } from "./components/ReviewModal";
import { AuthModal } from "./components/AuthModal";
import { LawyerApplyModal } from "./components/LawyerApplyModal";
import { Lawyer, Appointment } from "./types";

const MainApp: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>("home");

  // Modals state
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [activeConsultationAppt, setActiveConsultationAppt] = useState<Appointment | null>(null);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

  const [reviewAppt, setReviewAppt] = useState<Appointment | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const handleOpenLawyerProfile = (lawyer: Lawyer) => {
    setSelectedLawyer(lawyer);
    setIsProfileModalOpen(true);
  };

  const handleOpenBookSlot = (lawyer: Lawyer) => {
    setSelectedLawyer(lawyer);
    setIsProfileModalOpen(true);
  };

  const handleJoinConsultationRoom = (appointment: Appointment) => {
    setActiveConsultationAppt(appointment);
    setIsConsultationModalOpen(true);
  };

  const handleOpenReview = (appointment: Appointment) => {
    setReviewAppt(appointment);
    setIsReviewModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* Universal Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openAuthModal={() => setIsAuthModalOpen(true)}
        openApplyModal={() => setIsApplyModalOpen(true)}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {currentTab === "home" && (
          <HomePage
            onSelectLawyer={handleOpenLawyerProfile}
            onBookLawyer={handleOpenBookSlot}
            openApplyModal={() => setIsApplyModalOpen(true)}
          />
        )}

        {currentTab === "client-dashboard" && (
          <ClientDashboardPage
            onJoinRoom={handleJoinConsultationRoom}
            onOpenReview={handleOpenReview}
            onOpenBookLawyer={() => setCurrentTab("home")}
            onSelectLawyer={handleOpenLawyerProfile}
          />
        )}

        {currentTab === "my-appointments" && (
          <MyAppointmentsPage
            onJoinRoom={handleJoinConsultationRoom}
            onOpenReview={handleOpenReview}
            onOpenBookLawyer={() => setCurrentTab("home")}
          />
        )}

        {currentTab === "lawyer-dashboard" && (
          <LawyerDashboardPage onJoinRoom={handleJoinConsultationRoom} />
        )}

        {currentTab === "admin-dashboard" && <AdminDashboardPage />}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Modals */}
      <LawyerProfileModal
        lawyer={selectedLawyer}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onBookingSuccess={() => {
          if (user?.role === "CLIENT") {
            setCurrentTab("my-appointments");
          }
        }}
        openAuthModal={() => setIsAuthModalOpen(true)}
      />

      <ConsultationRoomModal
        appointment={activeConsultationAppt}
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        onConsultationEnded={() => {
          // Re-sync after consultation ended
          if (user?.role === "CLIENT" && activeConsultationAppt) {
            setReviewAppt(activeConsultationAppt);
            setIsReviewModalOpen(true);
          }
        }}
      />

      <ReviewModal
        appointment={reviewAppt}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onReviewSubmitted={() => {
          // Refresh list if on my-appointments
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(loggedRole) => {
          if (loggedRole === "LAWYER") setCurrentTab("lawyer-dashboard");
          else if (loggedRole === "ADMIN") setCurrentTab("admin-dashboard");
          else setCurrentTab("client-dashboard");
        }}
      />

      <LawyerApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        openAuthModal={() => setIsAuthModalOpen(true)}
        onSuccess={() => {
          setCurrentTab("lawyer-dashboard");
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
