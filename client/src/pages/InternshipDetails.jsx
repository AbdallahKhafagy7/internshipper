import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import { getInternshipById, deleteInternship } from '../api/internships';
import { applyForInternship, getMyApplications } from '../api/applications';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Briefcase, User as UserIcon, ArrowLeft, CheckCircle, RefreshCw, MapPin, Mail, ExternalLink, Building2, Pencil, Trash2 } from 'lucide-react';
import { resolveApplyHref } from '../utils/applyContact';
import { cloudinaryImageUrl } from '../utils/cloudinaryImage';
import { formatInternshipDeadline, displayCompany } from '../utils/internshipDisplay';
import EditInternshipModal from '../components/EditInternshipModal';
import Modal from '../components/Modal';

const InternshipDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSecondConfirmOpen, setIsSecondConfirmOpen] = useState(false);

    const { data: internship, isLoading: internshipLoading, isError } = useQuery({
        queryKey: ['internship', id],
        queryFn: () => getInternshipById(id),
    });

    const { data: applications, isLoading: applicationsLoading } = useQuery({
        queryKey: ['my-applications'],
        queryFn: () => getMyApplications(token),
        enabled: !!token,
    });

    const isLoading = internshipLoading || (!!token && applicationsLoading);

    const isApplied = applications?.some(app => 
        String(app.internshipId?._id || app.internshipId) === String(id)
    );

    const applyMutation = useMutation({
        mutationFn: () => applyForInternship(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries(['my-applications']);
        },
        onError: (err) => {
            setError(err.response?.data?.message || 'Failed to apply');
            setTimeout(() => setError(''), 3000);
        }
    });

    const applied = isApplied || applyMutation.isSuccess;

    const deleteMutation = useMutation({
        mutationFn: () => deleteInternship(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries(['internships']);
            navigate('/');
        }
    });

    if (isLoading) return (
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <RefreshCw className="animate-spin text-blue-500" size={48} />
        </div>
    );

    if (isError || !internship) return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-red-500">Internship not found</h2>
            <button onClick={() => navigate('/')} className="mt-4 text-blue-500 hover:underline flex items-center gap-2 mx-auto">
                <ArrowLeft size={18} /> Back to Home
            </button>
        </div>
    );

    const applyRaw = (internship.applyContact || '').trim();
    const applyHref = resolveApplyHref(internship.applyContact);
    const applyIsMail = applyHref?.startsWith('mailto:');
    const deadlineStr = formatInternshipDeadline(internship.deadline);
    const companyStr = displayCompany(internship.company);
    const isOwner = user && String(internship.postedBy?._id || internship.postedBy) === String(user._id);
    const isAdmin = user && user.role === 'admin';

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>

                {(isOwner || isAdmin) && (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsEditModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all font-semibold"
                        >
                            <Pencil size={18} />
                            <span>Edit</span>
                        </button>
                        <button 
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all font-semibold"
                        >
                            <Trash2 size={18} />
                            <span>Delete</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {internship.images && internship.images.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-gray-100 dark:bg-gray-900 border-b dark:border-gray-700">
                        {internship.images.map((img, i) => (
                            <img 
                                key={i} 
                                src={cloudinaryImageUrl(img, 'detail')} 
                                alt="" 
                                loading={i === 0 ? 'eager' : 'lazy'}
                                decoding="async"
                                className={`w-full h-80 object-cover ${internship.images.length === 1 ? 'md:col-span-2' : ''}`} 
                            />
                        ))}
                    </div>
                )}

                <div className="p-8 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{internship.title}</h1>
                            <p className="mt-1 flex items-center gap-2 text-lg text-gray-600 dark:text-gray-300">
                                <Building2 size={20} className="text-blue-500 shrink-0" />
                                <span>{companyStr || '—'}</span>
                            </p>
                        </div>
                        {internship.target && (
                            <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider self-start">
                                {internship.target}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-6 text-gray-600 dark:text-gray-400 border-y py-4 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <Briefcase size={20} className="text-blue-500" />
                            <span className="font-medium">{internship.industry}</span>
                        </div>
                        {deadlineStr && (
                            <div className="flex items-center gap-2">
                                <Calendar size={20} className="text-blue-500" />
                                <span>Deadline: {deadlineStr}</span>
                            </div>
                        )}
                        {internship.location && (
                            <div className="flex items-center gap-2">
                                <MapPin size={20} className="text-blue-500" />
                                <span>{internship.location}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <UserIcon size={20} className="text-blue-500" />
                            <span>Posted by: <span className="font-semibold">{internship.postedBy?.username}</span></span>
                        </div>
                    </div>

                    {(internship.description || '').trim() ? (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Description</h2>
                            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {internship.description}
                            </div>
                        </div>
                    ) : null}

                    <div className="pt-6 border-t dark:border-gray-700 space-y-4">
                        {applyRaw && (
                            <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Apply link or email</p>
                                <p className="text-sm text-gray-800 dark:text-gray-200 break-all mt-2 font-mono">{applyRaw}</p>
                            </div>
                        )}
                        {applyHref && !applyIsMail ? (
                            <a
                                href={applyHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-3 shadow-lg bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.01]"
                            >
                                <ExternalLink size={24} />
                                Apply on company site
                            </a>
                        ) : !applyHref && applyRaw ? (
                            <p className="text-center text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg py-3 px-4">
                                This apply value could not be opened as a link. Copy the text above or contact the poster.
                            </p>
                        ) : !applyRaw ? (
                            <p className="text-center text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg py-3 px-4">
                                No application link was added for this listing. Contact the poster if you need details.
                            </p>
                        ) : null}

                        {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}

                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Track your application in the app after you apply.</p>
                        {user ? (
                            <button 
                                disabled={applyMutation.isPending || applied}
                                className={`w-full py-3 rounded-xl font-semibold transition flex items-center justify-center gap-3 border-2 dark:border-gray-600 ${
                                    applied 
                                    ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400' 
                                    : 'border-blue-200 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                }`}
                                onClick={() => applyMutation.mutate()}
                            >
                                {applyMutation.isPending ? 'Saving…' : applied ? <><CheckCircle size={22}/> Tracked in app</> : 'I applied — track in app'}
                            </button>
                        ) : (
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg text-center">
                                <p className="text-gray-500 dark:text-gray-400 italic">Log in to track this application after you apply.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
                                deleteMutation.mutate();
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

export default InternshipDetails;
