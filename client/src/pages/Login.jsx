import { useState, useContext } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginAPI } from '../api/auth';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: loginAPI,
        onSuccess: (data) => {
            login(data, data.token);
            navigate('/');
        },
        onError: (err) => {
            setError(err.response?.data?.message || 'Login failed');
        }
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        mutation.mutate(formData);
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
            <div className="w-full max-w-md p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <h2 className="text-2xl font-bold mb-6 text-center">Login to Internshipper</h2>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Username <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="username"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Password <span className="text-red-500">*</span></label>
                        <input
                            type="password"
                            name="password"
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={mutation.isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition font-semibold"
                    >
                        {mutation.isPending ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm">
                    Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
