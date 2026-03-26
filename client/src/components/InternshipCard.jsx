import {
  Trash2,
  Calendar,
  MapPin,
  Briefcase,
  ExternalLink,
  Mail,
  Building2,
  Copy,
  Check,
  Pencil,
} from "lucide-react";
import { resolveApplyHref } from "../utils/applyContact";
import {
  formatInternshipDeadline,
  displayCompany,
} from "../utils/internshipDisplay";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { applyForInternship } from "../api/applications";
import Modal from "./Modal";
import EditInternshipModal from "./EditInternshipModal";

const InternshipCard = ({ internship, onDelete, isApplied }) => {
  const { user, token } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSecondConfirmOpen, setIsSecondConfirmOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const applyMutation = useMutation({
    mutationFn: () => applyForInternship(internship._id, token),
    onSuccess: () => {
      queryClient.invalidateQueries(["my-applications"]);
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Failed to apply");
      setTimeout(() => setError(""), 3000);
    },
  });

  const applied = isApplied || applyMutation.isSuccess;

  const applyRaw = (internship.applyContact || "").trim();
  const applyHref = resolveApplyHref(internship.applyContact);
  const deadlineStr = formatInternshipDeadline(internship.deadline);
  const companyStr = displayCompany(internship.company);
  const isOwner =
    user &&
    String(internship.postedBy?._id || internship.postedBy) ===
      String(user._id);
  const isAdmin = user && user.role === "admin";

  const handleCopyEmail = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(applyRaw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCardClick = () => navigate(`/internships/${internship._id}`);

  const handleApply = (e) => {
    e.stopPropagation();
    applyMutation.mutate();
  };

  const handleExternalApply = (e) => {
    e.stopPropagation();
    if (!applyHref) return;
    if (applyHref.startsWith("mailto:")) {
      window.location.href = applyHref;
    } else {
      window.open(applyHref, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white dark:bg-[#1e293b] rounded-lg border border-gray-200 dark:border-slate-700/50 shadow-sm hover:shadow-md dark:shadow-none overflow-hidden flex flex-col md:flex-row md:items-stretch cursor-pointer hover:border-blue-500/50 transition-all duration-300 h-full md:h-auto"
    >
      {/* LEFT SECTION - Content */}
      <div className="flex-1 p-4 md:p-5 flex flex-col min-w-0 overflow-hidden">
        {/* Header Group */}
        <div className="mb-3">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight mb-1 truncate">
            {internship.title}
          </h3>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm md:text-base text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5 truncate">
              <Building2 size={14} className="shrink-0" />
              {companyStr || "Unknown Company"}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-slate-300">
              <div className="flex items-center gap-1.5 shrink-0">
                <Briefcase size={13} className="text-gray-400 dark:text-slate-400" />
                <span>{internship.industry}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <MapPin size={13} className="text-gray-400 dark:text-slate-400" />
                <span>{internship.location || "Remote"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {internship.description && (
          <div className="mb-4 w-full overflow-hidden">
            <div className="relative">
              <p
                className={`text-xs md:text-sm text-gray-600 dark:text-slate-400 w-full break-all md:break-words whitespace-pre-wrap transition-all duration-300 ${
                  !isExpanded ? "line-clamp-2" : ""
                }`}
              >
                {internship.description}
              </p>

              {internship.description.length > 60 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-bold text-xs mt-1 block focus:outline-none bg-transparent border-none p-0"
                >
                  {isExpanded ? "show less" : "...read more"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer - Deadline */}
        {deadlineStr && (
          <div className="mt-auto pt-3 border-t border-gray-100 dark:border-slate-700/30 flex items-center gap-2 text-[11px] text-gray-500 dark:text-slate-400">
            <Calendar size={12} className="text-gray-400 dark:text-slate-500 shrink-0" />
            <span>Deadline: {deadlineStr}</span>
          </div>
        )}
      </div>

      {/* RIGHT SECTION - Actions */}
      <div className="flex flex-col justify-start items-stretch md:items-end gap-3 p-4 md:p-5 md:w-[200px] md:min-w-[200px] bg-gray-50 dark:bg-slate-900/50 md:bg-transparent border-t md:border-t-0 md:border-l border-gray-100 dark:border-slate-700/50">
        <div className="flex flex-col gap-2 w-full">
          {applyHref && !applyHref.startsWith("mailto:") && (
            <button
              type="button"
              className="w-full px-4 py-2 rounded-lg font-semibold text-sm transition-all bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 active:scale-95 shadow-sm shadow-blue-500/20"
              onClick={handleExternalApply}
            >
              <ExternalLink size={16} /> Apply
            </button>
          )}

          {applyHref && applyHref.startsWith("mailto:") && (
            <div
              onClick={handleCopyEmail}
              className="group/email flex items-center gap-2 p-2 bg-white dark:bg-slate-800/70 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700/50 cursor-pointer transition-all overflow-hidden"
            >
              <Mail size={12} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <p className="text-[10px] text-gray-600 dark:text-slate-300 truncate italic font-medium flex-1">
                {copied ? "Copied!" : applyRaw}
              </p>
              {copied ? (
                <Check size={12} className="text-green-600 dark:text-green-400 shrink-0" />
              ) : (
                <Copy size={12} className="text-gray-400 dark:text-slate-500 shrink-0" />
              )}
            </div>
          )}
        </div>

        <div className="w-full space-y-2">
          {user ? (
            <button
              disabled={applyMutation.isPending || applied}
              className={`w-full px-4 py-2 rounded-lg font-semibold text-sm transition-all border flex items-center justify-center gap-2 ${
                applied
                  ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20"
                  : "border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
              }`}
              onClick={handleApply}
            >
              {applyMutation.isPending
                ? "Tracking…"
                : applied
                  ? "Tracked"
                  : "Track Application"}
            </button>
          ) : (
            <div className="text-[10px] text-center text-gray-500 dark:text-slate-500 italic py-2">
              Login to track
            </div>
          )}

          {(isOwner || isAdmin) && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditModalOpen(true);
                }}
                className="flex-1 p-2 text-gray-500 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all flex justify-center border border-gray-200 dark:border-none"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteModalOpen(true);
                }}
                className="flex-1 p-2 text-gray-500 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all flex justify-center border border-gray-200 dark:border-none"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditInternshipModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        internship={internship}
        token={token}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Posting?"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-3 py-1 text-slate-400"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setIsSecondConfirmOpen(true);
              }}
              className="px-3 py-1 bg-red-600 text-white rounded"
            >
              Delete
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-300">
          This will remove the internship from the board.
        </p>
      </Modal>

      <Modal
        isOpen={isSecondConfirmOpen}
        onClose={() => setIsSecondConfirmOpen(false)}
        title="Are you 100% sure?"
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => setIsSecondConfirmOpen(false)}
              className="px-3 py-1 text-slate-400"
            >
              Back
            </button>
            <button
              onClick={() => {
                onDelete(internship._id);
                setIsSecondConfirmOpen(false);
              }}
              className="px-3 py-1 bg-red-600 text-white rounded"
            >
              Yes, Delete Forever
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-300">This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default InternshipCard;
