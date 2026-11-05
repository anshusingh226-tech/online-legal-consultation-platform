import React from "react";
import { Scale, ShieldCheck, HeartHandshake, PhoneCall, Mail, MapPin } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-300 pt-16 pb-12 border-t border-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-navy-900 border border-gold-500/30 text-gold-400 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold font-serif text-white tracking-tight">
                Juris<span className="text-gold-400">Connect</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              India's premier unified digital platform connecting citizens, entrepreneurs, and businesses with verified legal advocates across multiple legal specializations.
            </p>
            <div className="flex items-center gap-2 text-xs text-gold-400/90 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Bar Council Verified Advocates</span>
            </div>
          </div>

          {/* Practice Areas */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Legal Domains
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-gold-400 cursor-pointer">Civil & Commercial Disputes</li>
              <li className="hover:text-gold-400 cursor-pointer">Criminal Defense & Bail</li>
              <li className="hover:text-gold-400 cursor-pointer">Family Law & Mutual Divorce</li>
              <li className="hover:text-gold-400 cursor-pointer">Corporate & Startup Advisory</li>
              <li className="hover:text-gold-400 cursor-pointer">Property & Real Estate Law</li>
              <li className="hover:text-gold-400 cursor-pointer">Cyber Law & Digital Fraud</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Platform Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-gold-400 cursor-pointer">Search Verified Lawyers</li>
              <li className="hover:text-gold-400 cursor-pointer">Lawyer Enrollment Portal</li>
              <li className="hover:text-gold-400 cursor-pointer">Consultation Security Standards</li>
              <li className="hover:text-gold-400 cursor-pointer">Pricing & Fee Transparency</li>
              <li className="hover:text-gold-400 cursor-pointer">Privacy Policy & Terms of Service</li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Help & Assistance
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <span>support@jurisconnect.in</span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-gold-400 shrink-0" />
                <span>+91 (011) 4500-LEGAL</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span>Bar Council Building Road, New Delhi, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="border-t border-slate-800/80 pt-8 mt-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
          <p>
            © {new Date().getFullYear()} JurisConnect Aggregation Technologies. In compliance with Bar Council of India regulations, this platform is an informational directory and consultation coordination tool, not an advertisement or solicitation of legal representation.
          </p>
          <div className="flex items-center gap-4 shrink-0 text-slate-400">
            <span>Unified Mentor Capstone Project</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <HeartHandshake className="w-3.5 h-3.5" />
              Trusted Network
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
