import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Sun, Moon, LogOut, User as UserIcon, PlusCircle, Menu, X, LayoutDashboard, Search } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        navigate('/login');
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const navLinks = [
        { name: 'Browse', path: '/', icon: <Search size={18} /> },
        ...(user ? [
            { name: 'Post', path: '/post', icon: <PlusCircle size={18} /> },
            { name: 'Tracking', path: '/tracking', icon: <LayoutDashboard size={18} /> },
            ...(user.role === 'admin' ? [{ name: 'Admin', path: '/admin', icon: <UserIcon size={18} /> }] : []),
        ] : []),
    ];

    return (
        <nav className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Brand */}
                    <Link to="/" onClick={closeMenu} className="text-xl font-bold text-blue-600 dark:text-blue-400 shrink-0">
                        Internshipper
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    location.pathname === link.path
                                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                <div className="flex items-center space-x-1.5">
                                    {link.icon}
                                    <span>{link.name}</span>
                                </div>
                            </Link>
                        ))}

                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />

                        <button 
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition"
                            title="Toggle Theme"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {user ? (
                            <div className="flex items-center space-x-3 ml-2">
                                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                                    <UserIcon size={16} />
                                    <span className="text-sm font-semibold">{user.username}</span>
                                </div>
                                <button 
                                    onClick={handleLogout}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition shadow-sm"
                                    title="Logout"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2 ml-2">
                                <Link to="/login" className="px-4 py-2 text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline">
                                    Login
                                </Link>
                                <Link to="/signup" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition shadow-md shadow-blue-500/20">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Controls */}
                    <div className="flex md:hidden items-center space-x-2">
                        <button 
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            onClick={toggleMenu}
                            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 animate-in slide-in-from-top duration-200">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={(e) => {
                                        if (isActive) {
                                            e.preventDefault();
                                        } else {
                                            closeMenu();
                                        }
                                    }}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                                        isActive
                                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 cursor-default'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {link.icon}
                                    <span>{link.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                        {user ? (
                            <div className="px-4 space-y-3">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                                        <UserIcon size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">{user.username}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role} Account</div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-bold transition-colors"
                                >
                                    <LogOut size={18} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        ) : (
                            <div className="px-4 grid grid-cols-2 gap-3">
                                <Link
                                    to="/login"
                                    onClick={closeMenu}
                                    className="flex justify-center items-center px-4 py-3 border border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg font-bold text-sm"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    onClick={closeMenu}
                                    className="flex justify-center items-center px-4 py-3 bg-blue-600 text-white rounded-lg font-bold text-sm"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
