import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyApplications, updateApplicationStatus, untrackApplication } from '../api/applications';
import { AuthContext } from '../context/AuthContext';
import { RefreshCw, Clock, CheckCircle, XCircle, Users, ExternalLink, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

const Tracking = () => {
    const { token } = useContext(AuthContext);
    const queryClient = useQueryClient();
    const [untrackId, setUntrackId] = useState(null);

    const { data: applications, isLoading } = useQuery({
        queryKey: ['my-applications'],
        queryFn: () => getMyApplications(token),
        enabled: !!token,
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => updateApplicationStatus({ id, status, token }),
        onSuccess: () => {
            queryClient.invalidateQueries(['my-applications']);
        }
    });

    const untrackMutation = useMutation({
        mutationFn: (id) => untrackApplication(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries(['my-applications']);
            setUntrackId(null);
        }
    });

    const handleStatusChange = (id, newStatus) => {
        statusMutation.mutate({ id, status: newStatus });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'waiting': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'interview': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'waiting': return <Clock size={16} />;
            case 'interview': return <Users size={16} />;
            case 'rejected': return <XCircle size={16} />;
            case 'accepted': return <CheckCircle size={16} />;
            default: return null;
        }
    };

    if (isLoading) return (
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <RefreshCw className="animate-spin text-blue-500" size={48} />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Applied Internships</h1>
            
            {applications?.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">You haven't applied to any internships yet.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {applications?.map(app => {
                        const internshipId = app.internshipId?._id || app.internshipId;
                        return (
                        <div key={app._id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="space-y-1 w-full sm:w-auto">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md">{app.internshipId?.title || 'Unknown Internship'}</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {[app.internshipId?.company, app.internshipId?.industry].filter(Boolean).join(' • ')}
                                    {app.internshipId?.postedBy?.username && ` • Posted by ${app.internshipId.postedBy.username}`}
                                </p>
                                <p className="text-xs text-gray-400">Applied on: {new Date(app.appliedDate).toLocaleDateString()}</p>
                                {internshipId && (
                                    <Link
                                        to={`/internships/${internshipId}`}
                                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-2"
                                    >
                                        View internship page <ExternalLink size={14} />
                                    </Link>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-3 shrink-0">
                                <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold capitalize ${getStatusStyle(app.status)}`}>
                                    {getStatusIcon(app.status)}
                                    {app.status}
                                </div>
                                
                                <select 
                                    className="p-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                    value={app.status}
                                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                    disabled={statusMutation.isPending}
                                >
                                    <option value="waiting">Waiting</option>
                                    <option value="interview">Interview</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="accepted">Accepted</option>
                                </select>

                                <button
                                    onClick={() => setUntrackId(app._id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Untrack Application"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}

            <Modal
                isOpen={!!untrackId}
                onClose={() => setUntrackId(null)}
                title="Untrack Application?"
                footer={
                    <div className="flex gap-2">
                        <button
                            onClick={() => setUntrackId(null)}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => untrackMutation.mutate(untrackId)}
                            disabled={untrackMutation.isPending}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                        >
                            {untrackMutation.isPending ? 'Removing...' : 'Untrack'}
                        </button>
                    </div>
                }
            >
                <p className="text-gray-600 dark:text-gray-300">
                    Are you sure you want to stop tracking this application? This action cannot be undone.
                </p>
            </Modal>
        </div>
    );
};

export default Tracking;
