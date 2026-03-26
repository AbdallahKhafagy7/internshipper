import { useContext, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInternships, deleteInternship } from '../api/internships';
import { getUsers, updateUserRole } from '../api/users';
import { AuthContext } from '../context/AuthContext';
import { Trash2, RefreshCw, AlertTriangle, Shield, ShieldOff } from 'lucide-react';
import Modal from '../components/Modal';
import { formatInternshipDeadline } from '../utils/internshipDisplay';

const Admin = () => {
    const { user, token } = useContext(AuthContext);
    const queryClient = useQueryClient();
    const [selectedId, setSelectedId] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const [internshipPage, setInternshipPage] = useState(1);

    const { data: internshipsData, isLoading } = useQuery({
        queryKey: ['admin-internships', internshipPage],
        queryFn: () => getInternships({ page: internshipPage, limit: 10 }),
    });

    const internships = internshipsData?.internships || [];
    const totalInternshipPages = internshipsData?.pages || 1;

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteInternship(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-internships']);
            setIsConfirmOpen(false);
            setSelectedId(null);
        }
    });

    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => getUsers(token),
        enabled: !!token,
    });

    const roleMutation = useMutation({
        mutationFn: ({ userId, role }) => updateUserRole(userId, role, token),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users']);
        },
    });

    const handleDeleteClick = (id) => {
        setSelectedId(id);
        setIsConfirmOpen(true);
    };

    const confirmDelete = () => {
        deleteMutation.mutate(selectedId);
    };

    const handlePageChange = (newPage) => {
        setInternshipPage(newPage);
    };

    if (isLoading || usersLoading) return (
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <RefreshCw className="animate-spin text-blue-500" size={48} />
        </div>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold flex items-center gap-3 text-red-600 dark:text-red-400">
                <AlertTriangle size={32} />
                Admin Moderation Panel
            </h1>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Shield className="text-blue-600 dark:text-blue-400" size={24} />
                    User roles
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    New accounts are always students. Promote users to admin here—you cannot change your own role.
                </p>
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700/50">
                                <th className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold">Username</th>
                                <th className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold">Email</th>
                                <th className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold">Role</th>
                                <th className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users?.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-10 text-center text-gray-500">No users found.</td>
                                </tr>
                            ) : (
                                users?.map((u) => {
                                    const isSelf = String(user?._id) === String(u._id);
                                    return (
                                        <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition">
                                            <td className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold">
                                                {u.username}
                                                {isSelf && (
                                                    <span className="ml-2 text-xs font-normal text-gray-500">(you)</span>
                                                )}
                                            </td>
                                            <td className="p-4 border-b border-gray-200 dark:border-gray-700 text-sm">
                                                {u.email || '—'}
                                            </td>
                                            <td className="p-4 border-b border-gray-200 dark:border-gray-700 capitalize">
                                                {u.role}
                                            </td>
                                            <td className="p-4 border-b border-gray-200 dark:border-gray-700 text-center">
                                                {isSelf ? (
                                                    <span className="text-xs text-gray-500">—</span>
                                                ) : u.role === 'admin' ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => roleMutation.mutate({ userId: u._id, role: 'student' })}
                                                        disabled={roleMutation.isPending}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                                                        title="Remove admin"
                                                    >
                                                        <ShieldOff size={16} />
                                                        Remove admin
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => roleMutation.mutate({ userId: u._id, role: 'admin' })}
                                                        disabled={roleMutation.isPending}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                                        title="Make admin"
                                                    >
                                                        <Shield size={16} />
                                                        Make admin
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {roleMutation.isError && (
                    <p className="text-sm text-red-500">
                        {roleMutation.error?.response?.data?.message || 'Could not update role.'}
                    </p>
                )}
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Internship postings</h2>
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700/50">
                            <th className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold">Title</th>
                            <th className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold">Company</th>
                            <th className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold">Industry</th>
                            <th className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold">Posted By</th>
                            <th className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold">Target</th>
                            <th className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold">Deadline</th>
                            <th className="p-4 border-b border-gray-200 dark:border-gray-700 font-bold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {internships?.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="p-10 text-center text-gray-500">No internship postings available.</td>
                            </tr>
                        ) : (
                            internships?.map(internship => (
                                <tr key={internship._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition">
                                    <td className="p-4 border-b border-gray-200 dark:border-gray-700">{internship.title}</td>
                                    <td className="p-4 border-b border-gray-200 dark:border-gray-700">{internship.company || '—'}</td>
                                    <td className="p-4 border-b border-gray-200 dark:border-gray-700">{internship.industry}</td>
                                    <td className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold">{internship.postedBy?.username}</td>
                                    <td className="p-4 border-b border-gray-200 dark:border-gray-700 capitalize">{internship.target}</td>
                                    <td className="p-4 border-b border-gray-200 dark:border-gray-700 text-sm">
                                        {formatInternshipDeadline(internship.deadline) || '—'}
                                    </td>
                                    <td className="p-4 border-b border-gray-200 dark:border-gray-700 text-center">
                                        <button 
                                            onClick={() => handleDeleteClick(internship._id)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                            title="Moderate / Delete"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Internship Pagination */}
            {totalInternshipPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4">
                    <button
                        onClick={() => handlePageChange(internshipPage - 1)}
                        disabled={internshipPage === 1}
                        className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Page {internshipPage} of {totalInternshipPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(internshipPage + 1)}
                        disabled={internshipPage === totalInternshipPages}
                        className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        Next
                    </button>
                </div>
            )}
            </section>

            <Modal 
                isOpen={isConfirmOpen} 
                onClose={() => setIsConfirmOpen(false)}
                title="Confirm Moderation Action"
                footer={
                    <>
                        <button onClick={() => setIsConfirmOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                        <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete Posting</button>
                    </>
                }
            >
                <p>Are you sure you want to delete this internship posting as an administrator? This action is permanent and will notify no one.</p>
            </Modal>
        </div>
    );
};

export default Admin;
