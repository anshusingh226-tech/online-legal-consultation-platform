import React, { useState, useEffect, useRef } from "react";
import { Appointment, ChatMessage, DocumentItem } from "../types";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import {
  X,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Paperclip,
  FileText,
  Send,
  Save,
  Clock,
  Download,
  AlertCircle,
  FileCheck,
} from "lucide-react";

interface ConsultationRoomModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onConsultationEnded: () => void;
}

export const ConsultationRoomModal: React.FC<ConsultationRoomModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onConsultationEnded,
}) => {
  const { user } = useAuth();

  // Media Controls State
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(appointment?.mode === "VIDEO");
  const [activeSideTab, setActiveSideTab] = useState<"chat" | "documents" | "summary">("chat");

  // Room State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [summary, setSummary] = useState(appointment?.consultation?.summary || "");
  const [savingSummary, setSavingSummary] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Call duration counter
  const [callSeconds, setCallSeconds] = useState(0);
  const [callActive, setCallActive] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLawyer = user?.role === "LAWYER";

  useEffect(() => {
    if (!isOpen || !appointment) return;

    // Load initial consultation data & documents
    api.getConsultation(appointment.id).then((res) => {
      if (res.data?.messages) setMessages(res.data.messages);
      if (res.data?.consultation?.summary) setSummary(res.data.consultation.summary);
    }).catch(console.error);

    api.getAppointmentDocuments(appointment.id).then((res) => {
      if (res.data) setDocuments(res.data);
    }).catch(console.error);

    // Auto start consultation if not started
    if (appointment.status === "ACCEPTED" && (!appointment.consultation || appointment.consultation.status === "SCHEDULED")) {
      api.startConsultation(appointment.id).catch(console.error);
    }

    // Call timer
    const interval = setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);

    // Poll messages every 3 seconds
    const msgInterval = setInterval(() => {
      api.getChatMessages(appointment.id).then((res) => {
        if (res.data) setMessages(res.data);
      }).catch(() => {});
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(msgInterval);
    };
  }, [isOpen, appointment]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen || !appointment) return null;

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await api.sendChatMessage(appointment.id, newMessage);
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("appointmentId", appointment.id);
      formData.append("type", "CONSULTATION");

      const res = await api.uploadDocument(formData);
      setDocuments((prev) => [...prev, res.data]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      alert(err.message || "Failed to upload document");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSaveSummary = async () => {
    if (!summary.trim()) return;
    setSavingSummary(true);
    try {
      await api.saveConsultationSummary(appointment.id, summary);
      alert("Consultation summary saved!");
    } catch (err: any) {
      alert(err.message || "Failed to save summary");
    } finally {
      setSavingSummary(false);
    }
  };

  const handleEndConsultation = async () => {
    if (window.confirm("Are you sure you want to conclude this consultation?")) {
      try {
        await api.endConsultation(appointment.id, summary);
        setCallActive(false);
        onConsultationEnded();
        onClose();
      } catch (err: any) {
        alert(err.message || "Failed to end consultation");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Top Bar */}
        <div className="px-5 py-3.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm sm:text-base text-white">
                  Consultation Session • {appointment.mode}
                </h3>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                  {appointment.duration} mins booked
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Client: <span className="text-slate-200">{appointment.client?.fullName}</span> | Advocate:{" "}
                <span className="text-slate-200">{appointment.lawyer?.user.fullName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-emerald-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(callSeconds)}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Workspace: Left Video/Audio Area, Right Sidepanel */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
          {/* Left Column: Virtual Video / Audio Stage */}
          <div className="lg:col-span-2 bg-slate-950 flex flex-col justify-between p-4 relative overflow-hidden">
            {/* Participant Screens */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-0">
              {/* Lawyer Screen */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                <div className="z-20 flex justify-between items-start">
                  <span className="text-xs font-semibold bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-xs text-gold-400 border border-gold-500/20">
                    Advocate: {appointment.lawyer?.user.fullName}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-medium">● Connected</span>
                </div>

                {/* Simulated Video Frame */}
                <div className="my-auto flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-navy-800 text-gold-400 font-serif text-3xl font-bold flex items-center justify-center border-2 border-gold-500/40 shadow-xl mb-3">
                    ⚖️
                  </div>
                  <p className="text-xs text-slate-400">Live Secure Legal Channel</p>
                </div>

                <div className="z-20 text-[11px] text-slate-300">
                  <span>Counsel Chamber</span>
                </div>
              </div>

              {/* Client Screen */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                <div className="z-20 flex justify-between items-start">
                  <span className="text-xs font-semibold bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-xs text-slate-200 border border-slate-700">
                    Client: {appointment.client?.fullName}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-medium">● Active</span>
                </div>

                {/* Simulated Video Frame */}
                <div className="my-auto flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-800 text-white font-serif text-3xl font-bold flex items-center justify-center border-2 border-slate-700 shadow-xl mb-3">
                    👤
                  </div>
                  <p className="text-xs text-slate-400">Client Audio/Video Feed</p>
                </div>

                <div className="z-20 text-[11px] text-slate-300 flex items-center justify-between">
                  <span>Encrypted End-to-End</span>
                  <span className="text-emerald-400 font-mono text-[10px]">HD 720p</span>
                </div>
              </div>
            </div>

            {/* In-Call Media Control Bar */}
            <div className="mt-4 py-3 px-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between shrink-0 shadow-lg">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`p-3 rounded-xl transition-colors ${
                    isMicOn ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                  title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                >
                  {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`p-3 rounded-xl transition-colors ${
                    isVideoOn ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                  title={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
                >
                  {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>

                <label
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer transition-colors"
                  title="Attach Case Document"
                >
                  <Paperclip className="w-4 h-4" />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.png,.jpg"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleEndConsultation}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-md"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>{isLawyer ? "Conclude & Complete" : "Leave Session"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Chat, Documents & Summary Sidepanel */}
          <div className="bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between overflow-hidden">
            {/* Sidepanel Nav */}
            <div className="px-3 pt-3 border-b border-slate-800 flex items-center gap-1 bg-slate-950/40 shrink-0">
              <button
                onClick={() => setActiveSideTab("chat")}
                className={`flex-1 py-2 rounded-t-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  activeSideTab === "chat"
                    ? "bg-slate-900 text-white border-t border-x border-slate-800 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat ({messages.length})
              </button>

              <button
                onClick={() => setActiveSideTab("documents")}
                className={`flex-1 py-2 rounded-t-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  activeSideTab === "documents"
                    ? "bg-slate-900 text-white border-t border-x border-slate-800 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Docs ({documents.length})
              </button>

              <button
                onClick={() => setActiveSideTab("summary")}
                className={`flex-1 py-2 rounded-t-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  activeSideTab === "summary"
                    ? "bg-slate-900 text-white border-t border-x border-slate-800 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileCheck className="w-3.5 h-3.5 text-gold-400" />
                Case Notes
              </button>
            </div>

            {/* TAB 1: REAL-TIME IN-ROOM CHAT */}
            {activeSideTab === "chat" && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden p-3">
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      <MessageSquare className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                      <p>No messages yet.</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">Use this chat for sharing clauses, links or notes.</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                            {msg.senderName} ({msg.senderRole})
                          </span>
                          <div
                            className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                              isMe
                                ? "bg-navy-700 text-white rounded-tr-xs"
                                : "bg-slate-800 text-slate-200 rounded-tl-xs border border-slate-700"
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-slate-500 mt-0.5 px-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="mt-2 pt-2 border-t border-slate-800 flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type legal question or message..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-navy-600"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-gold-400 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: DOCUMENTS */}
            {activeSideTab === "documents" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-300">Consultation Files</span>
                  <label className="text-xs font-semibold text-gold-400 hover:underline cursor-pointer flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.png,.jpg"
                    />
                  </label>
                </div>

                {uploadingDoc && (
                  <p className="text-xs text-amber-400 animate-pulse">Uploading file to secure storage...</p>
                )}

                {documents.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p>No documents uploaded for this appointment.</p>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="w-4 h-4 text-gold-400 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-medium text-slate-200 truncate">{doc.fileName}</p>
                          <p className="text-[10px] text-slate-500">
                            {(doc.fileSize / 1024).toFixed(1)} KB • By {doc.uploadedBy?.fullName || "User"}
                          </p>
                        </div>
                      </div>

                      <a
                        href={api.getDocumentDownloadUrl(doc.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
                        title="Download / View"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: CASE SUMMARY & LEGAL ADVICE */}
            {activeSideTab === "summary" && (
              <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gold-400 block mb-1">
                      Case Summary & Legal Advice
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      {isLawyer
                        ? "Record key legal takeaways, recommended filings, and formal opinions for your client."
                        : "Official legal opinion and summary recorded by your advocate."}
                    </p>
                  </div>

                  {isLawyer ? (
                    <textarea
                      rows={10}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="e.g. Advised client regarding 13B mutual divorce petition and 6-month cooling off waiver. Recommended drafting MOU on child visitation..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-gold-500 leading-relaxed"
                    ></textarea>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed min-h-[150px]">
                      {summary || "The advocate has not yet submitted the final case notes."}
                    </div>
                  )}
                </div>

                {isLawyer && (
                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={handleSaveSummary}
                      disabled={savingSummary}
                      className="px-4 py-2 rounded-xl bg-gold-600 hover:bg-gold-500 text-navy-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingSummary ? "Saving..." : "Save Case Notes"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
