import React, { useState, useEffect } from "react";
import { Lawyer, LegalDomain } from "../types";
import { api } from "../services/api";
import { LawyerCard } from "../components/LawyerCard";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Scale,
  ShieldCheck,
  Video,
  FileCheck,
  Award,
  Sparkles,
} from "lucide-react";

interface HomePageProps {
  onSelectLawyer: (lawyer: Lawyer) => void;
  onBookLawyer: (lawyer: Lawyer) => void;
  openApplyModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectLawyer,
  onBookLawyer,
  openApplyModal,
}) => {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [domains, setDomains] = useState<LegalDomain[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [minExperience, setMinExperience] = useState<number>(0);
  const [maxFee, setMaxFee] = useState<number>(5000);
  const [sortBy, setSortBy] = useState<"rating" | "experience" | "fee">("rating");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [lawyersRes, domainsRes] = await Promise.all([
        api.getLawyers(),
        api.getLegalDomains(),
      ]);
      if (lawyersRes.data) setLawyers(lawyersRes.data);
      if (domainsRes.data) setDomains(domainsRes.data);
    } catch (err) {
      console.error("Failed to load platform data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedDomain !== "ALL") params.legalDomain = selectedDomain;
      if (selectedLocation.trim()) params.location = selectedLocation.trim();
      if (minExperience > 0) params.minExperience = minExperience.toString();
      if (maxFee < 5000) params.maxFee = maxFee.toString();

      const res = await api.getLawyers(params);
      if (res.data) setLawyers(res.data);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Client-side sorting
  const sortedLawyers = [...lawyers].sort((a, b) => {
    if (sortBy === "rating") return b.averageRating - a.averageRating;
    if (sortBy === "experience") return b.yearsOfExperience - a.yearsOfExperience;
    if (sortBy === "fee") return a.consultationFee - b.consultationFee;
    return 0;
  });

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-navy-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-800/80 border border-gold-500/30 text-gold-300 text-xs font-semibold backdrop-blur-md shadow-xs animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Unified Legal Technology Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-serif tracking-tight text-white leading-tight">
            Consult Verified Legal Advocates <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500">
              On-Demand & Transparently
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Connect with pre-vetted advocates across Civil, Criminal, Family, Corporate, and Property law. Book instant online consultations via Video, Audio, or Chat with zero hidden charges.
          </p>

          {/* Search Box Card */}
          <div className="max-w-4xl mx-auto pt-6">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white p-2.5 sm:p-3 rounded-3xl shadow-2xl border border-slate-200/40 text-slate-800 grid grid-cols-1 md:grid-cols-12 gap-2 text-left"
            >
              {/* Keyword / Lawyer Name */}
              <div className="md:col-span-5 px-3 py-2 flex items-center gap-2.5 border-b md:border-b-0 md:border-r border-slate-200">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Lawyer name, keyword, or matter..."
                  className="w-full text-xs sm:text-sm bg-transparent placeholder:text-slate-400 text-slate-800 focus:outline-hidden"
                />
              </div>

              {/* Legal Domain Select */}
              <div className="md:col-span-4 px-3 py-2 flex items-center gap-2.5 border-b md:border-b-0 md:border-r border-slate-200">
                <Scale className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-transparent text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">All Legal Domains</option>
                  {domains.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* City / Location */}
              <div className="md:col-span-3 px-3 py-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 w-full">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    placeholder="City (e.g. Delhi)"
                    className="w-full text-xs sm:text-sm bg-transparent placeholder:text-slate-400 text-slate-800 focus:outline-hidden"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs sm:text-sm shadow-md transition-colors shrink-0"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Quick Trust Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8 border-t border-navy-800/80 text-left">
            <div>
              <span className="block text-xl sm:text-2xl font-bold font-serif text-white">100%</span>
              <span className="text-[11px] text-slate-400">Bar Verified Advocates</span>
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-bold font-serif text-white">10+ Domains</span>
              <span className="text-[11px] text-slate-400">Civil, Criminal, Corporate</span>
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-bold font-serif text-white">30 Mins</span>
              <span className="text-[11px] text-slate-400">Standard Consultations</span>
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-bold font-serif text-white">Encrypted</span>
              <span className="text-[11px] text-slate-400">Audio, Video & Chat Rooms</span>
            </div>
          </div>
        </div>
      </section>

      {/* Domain Category Filter Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Browse Specialization Areas
            </span>
            <span className="text-xs text-slate-400">{domains.length} categories available</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => {
                setSelectedDomain("ALL");
                api.getLawyers().then((res) => res.data && setLawyers(res.data));
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDomain === "ALL"
                  ? "bg-navy-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All Categories
            </button>
            {domains.map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  setSelectedDomain(d.name);
                  api.getLawyers({ legalDomain: d.name }).then((res) => res.data && setLawyers(res.data));
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedDomain === d.name
                    ? "bg-navy-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{d.name}</span>
                {d.verifiedLawyersCount !== undefined && d.verifiedLawyersCount > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedDomain === d.name ? "bg-navy-700 text-white" : "bg-slate-200 text-slate-700"}`}>
                    {d.verifiedLawyersCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Lawyer Discovery Grid & Side Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
              Verified Legal Advocates
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Showing {sortedLawyers.length} accredited legal practitioners ready for online consultation
            </p>
          </div>

          {/* Sort Controller */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-hidden focus:ring-1 focus:ring-navy-800 cursor-pointer"
            >
              <option value="rating">Highest Rated</option>
              <option value="experience">Years of Experience</option>
              <option value="fee">Consultation Fee (Low to High)</option>
            </select>
          </div>
        </div>

        {/* Lawyer Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-200"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded-md w-1/2"></div>
                  </div>
                </div>
                <div className="h-12 bg-slate-100 rounded-xl"></div>
                <div className="h-16 bg-slate-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : sortedLawyers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8">
            <Scale className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Advocates Match Your Criteria</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Try broadening your search keywords, clearing location filters, or exploring other legal domain specializations.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedDomain("ALL");
                setSelectedLocation("");
                setMinExperience(0);
                setMaxFee(5000);
                fetchInitialData();
              }}
              className="px-4 py-2 rounded-xl bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedLawyers.map((lawyer) => (
              <LawyerCard
                key={lawyer.id}
                lawyer={lawyer}
                onSelect={onSelectLawyer}
                onBook={onBookLawyer}
              />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
              How JurisConnect Operates
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Four streamlined steps to receive accredited, confidential legal guidance from anywhere in India
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
              <span className="text-4xl font-extrabold font-serif text-slate-100 absolute top-4 right-4">01</span>
              <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-900 flex items-center justify-center font-bold mb-4">
                <Search className="w-5 h-5 text-navy-800" />
              </div>
              <h4 className="font-semibold text-slate-900 text-sm mb-1.5">Discover & Filter</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Filter by practice area, years at the bar, location, and upfront transparent consultation fees.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
              <span className="text-4xl font-extrabold font-serif text-slate-100 absolute top-4 right-4">02</span>
              <div className="w-10 h-10 rounded-xl bg-gold-50 text-gold-600 flex items-center justify-center font-bold mb-4">
                <ShieldCheck className="w-5 h-5 text-gold-600" />
              </div>
              <h4 className="font-semibold text-slate-900 text-sm mb-1.5">Schedule Available Slot</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose an available slot verified against the advocate's real-time schedule, and select Video, Audio, or Chat.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
              <span className="text-4xl font-extrabold font-serif text-slate-100 absolute top-4 right-4">03</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4">
                <Video className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="font-semibold text-slate-900 text-sm mb-1.5">Consult Virtually</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter the encrypted consultation room, discuss your legal questions, and exchange case documents safely.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
              <span className="text-4xl font-extrabold font-serif text-slate-100 absolute top-4 right-4">04</span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-4">
                <FileCheck className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-semibold text-slate-900 text-sm mb-1.5">Receive Case Notes</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Access official summary notes and legal opinions prepared by your advocate, and leave authentic feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Advocate Call-to-Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl border border-navy-800">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-semibold text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              Bar-Enrolled Advocates
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-serif">
              Expand Your Practice Nationally with JurisConnect
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Set your own consultation fees, define your weekly calendar, accept client consultations seamlessly, and build verified credibility with client reviews.
            </p>
          </div>

          <button
            onClick={openApplyModal}
            className="px-6 py-3.5 rounded-2xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs sm:text-sm transition-colors shadow-md shrink-0 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Apply as Verified Advocate</span>
          </button>
        </div>
      </section>
    </div>
  );
};
