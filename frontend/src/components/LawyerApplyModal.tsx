import React, { useState, useEffect } from "react";
import { LegalDomain } from "../types";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  X,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  FileCheck,
} from "lucide-react";

interface LawyerApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  openAuthModal: () => void;
  onSuccess: () => void;
}

export const LawyerApplyModal: React.FC<LawyerApplyModalProps> = ({
  isOpen,
  onClose,
  openAuthModal,
  onSuccess,
}) => {
  const { user, isAuthenticated, refreshUser } = useAuth();

  const [barRegistrationNumber, setBarRegistrationNumber] = useState("");
  const [barCouncil, setBarCouncil] = useState("Bar Council of Delhi");
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(5);
  const [location, setLocation] = useState("");
  const [consultationFee, setConsultationFee] = useState<number>(1200);
  const [bio, setBio] = useState("");
  const [selectedDomainIds, setSelectedDomainIds] = useState<string[]>([]);

  const [availableDomains, setAvailableDomains] = useState<LegalDomain[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getLegalDomains().then((res) => {
        if (res.data) setAvailableDomains(res.data);
      }).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleDomain = (id: string) => {
    setSelectedDomainIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    if (selectedDomainIds.length === 0) {
      setError("Please select at least one legal domain specialization.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.applyAsLawyer({
        barRegistrationNumber: barRegistrationNumber.trim(),
        barCouncil: barCouncil.trim(),
        yearsOfExperience: Number(yearsOfExperience),
        location: location.trim(),
        consultationFee: Number(consultationFee),
        bio: bio.trim() || undefined,
        legalDomainIds: selectedDomainIds,
      });

      await refreshUser();
      setSuccess("Your lawyer application has been submitted successfully! An administrator will review your credentials.");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to submit lawyer application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-serif">
            Enroll as Legal Advocate
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Provide your official Bar Council registration details for platform accreditation
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bar Registration Number *
              </label>
              <input
                type="text"
                required
                value={barRegistrationNumber}
                onChange={(e) => setBarRegistrationNumber(e.target.value)}
                placeholder="e.g. D/1428/2012"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-navy-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enrolled Bar Council *
              </label>
              <select
                value={barCouncil}
                onChange={(e) => setBarCouncil(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-navy-800 bg-white"
              >
                <option value="Bar Council of Delhi">Bar Council of Delhi</option>
                <option value="Bar Council of Maharashtra & Goa">Bar Council of Maharashtra & Goa</option>
                <option value="Karnataka State Bar Council">Karnataka State Bar Council</option>
                <option value="Bar Council of Tamil Nadu">Bar Council of Tamil Nadu</option>
                <option value="Bar Council of Uttar Pradesh">Bar Council of Uttar Pradesh</option>
                <option value="Bar Council of West Bengal">Bar Council of West Bengal</option>
                <option value="Bar Council of Telangana">Bar Council of Telangana</option>
                <option value="Other State Bar Council">Other State Bar Council</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Years of Experience *
              </label>
              <input
                type="number"
                min={0}
                max={60}
                required
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-navy-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City / Location *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. New Delhi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-navy-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Consultation Fee (₹) *
              </label>
              <input
                type="number"
                min={0}
                step={50}
                required
                value={consultationFee}
                onChange={(e) => setConsultationFee(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-navy-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Professional Bio & Court Appearances
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Highlight courtroom experience, notable matters, trial courts, High Court or Supreme Court practice..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-navy-800"
            ></textarea>
          </div>

          {/* Legal Domains Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Legal Domain Specializations * (At least 1)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableDomains.map((domain) => {
                const isSelected = selectedDomainIds.includes(domain.id);
                return (
                  <button
                    key={domain.id}
                    type="button"
                    onClick={() => toggleDomain(domain.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate">{domain.name}</span>
                    {isSelected && <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm disabled:opacity-50 mt-4"
          >
            {loading ? "Submitting Application..." : "Submit Application for Bar Verification"}
          </button>
        </form>
      </div>
    </div>
  );
};
