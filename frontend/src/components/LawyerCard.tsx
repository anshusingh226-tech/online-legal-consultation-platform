import React from "react";
import { Lawyer } from "../types";
import {
  ShieldCheck,
  Star,
  MapPin,
  Briefcase,
  Video,
  Phone,
  MessageSquare,
  Award,
} from "lucide-react";

interface LawyerCardProps {
  lawyer: Lawyer;
  onSelect: (lawyer: Lawyer) => void;
  onBook: (lawyer: Lawyer) => void;
}

export const LawyerCard: React.FC<LawyerCardProps> = ({ lawyer, onSelect, onBook }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      <div className="p-5 sm:p-6">
        {/* Top Header with Avatar & Rating */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-800 text-white flex items-center justify-center font-serif text-lg font-bold shadow-sm shrink-0 border border-navy-700/30">
              {lawyer.fullName
                .replace("Adv.", "")
                .trim()
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-semibold text-slate-900 text-base sm:text-lg group-hover:text-navy-900 transition-colors">
                  {lawyer.fullName}
                </h3>
                {lawyer.verificationStatus === "APPROVED" && (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"
                    title="Bar Council Verified Advocate"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {lawyer.location} • <span className="text-slate-400">{lawyer.barCouncil}</span>
              </p>
            </div>
          </div>

          {/* Rating Badge */}
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl text-amber-800 font-bold text-xs sm:text-sm shadow-2xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{lawyer.averageRating > 0 ? lawyer.averageRating.toFixed(1) : "New"}</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">
              {lawyer.totalReviews} {lawyer.totalReviews === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>

        {/* Experience & Bar Registration */}
        <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-50/80 rounded-xl px-3 py-2 border border-slate-100 mb-3.5">
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-navy-700" />
            <span className="font-semibold text-slate-800">{lawyer.yearsOfExperience} yrs</span>
            <span className="text-slate-400">exp</span>
          </div>
          <div className="w-px h-3.5 bg-slate-200"></div>
          <div className="flex items-center gap-1.5 truncate">
            <Award className="w-3.5 h-3.5 text-gold-600" />
            <span className="text-slate-500 truncate text-[11px]">Bar Reg: {lawyer.barRegistrationNumber}</span>
          </div>
        </div>

        {/* Bio snippet */}
        {lawyer.bio && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {lawyer.bio}
          </p>
        )}

        {/* Legal Domains Chips */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {lawyer.legalDomains?.slice(0, 3).map((domain) => (
            <span
              key={domain.id}
              className="text-[11px] font-medium bg-navy-50 text-navy-800 px-2.5 py-1 rounded-lg border border-navy-100"
            >
              {domain.name}
            </span>
          ))}
          {lawyer.legalDomains && lawyer.legalDomains.length > 3 && (
            <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
              +{lawyer.legalDomains.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Footer / Fee & Actions */}
      <div className="px-5 py-4 sm:px-6 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Consultation Fee</span>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-bold text-navy-950">₹{lawyer.consultationFee}</span>
            <span className="text-[11px] text-slate-500">/ 30 min</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 text-slate-400 mr-1" title="Modes available">
            <Video className="w-3.5 h-3.5" />
            <Phone className="w-3.5 h-3.5" />
            <MessageSquare className="w-3.5 h-3.5" />
          </div>

          <button
            onClick={() => onSelect(lawyer)}
            className="text-xs font-semibold px-3 py-2 rounded-xl text-slate-700 hover:bg-white hover:text-navy-900 border border-slate-200 transition-colors shadow-2xs"
          >
            Profile
          </button>
          <button
            onClick={() => onBook(lawyer)}
            className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white shadow-xs transition-colors"
          >
            Book Slot
          </button>
        </div>
      </div>
    </div>
  );
};
