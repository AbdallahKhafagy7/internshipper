import { ChevronDown, Filter, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getIndustries } from '../api/internships';

const CustomDropdown = ({ label, name, value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    const handleSelect = (optionValue) => {
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
    };

    return (
        <div className="space-y-2" ref={dropdownRef}>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                {label}
            </label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-slate-200 text-sm hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all duration-200 focus:ring-2 focus:ring-blue-500/40 focus:outline-none shadow-sm dark:shadow-none"
                >
                    <span className="truncate">{selectedOption.label}</span>
                    <ChevronDown 
                        size={16} 
                        className={`text-gray-400 dark:text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                    />
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className={`w-full px-4 py-2 text-left text-sm transition-colors duration-200 ${
                                    value === option.value 
                                    ? 'bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-medium' 
                                    : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const SidebarFilters = ({ filters, onFilterChange, onClearAll }) => {
    const { data: dbIndustries = [] } = useQuery({
        queryKey: ['industries'],
        queryFn: getIndustries,
    });

    const industries = [
        { label: 'All Industries', value: 'All' },
        ...dbIndustries.map(ind => ({ label: ind, value: ind }))
    ];

    const sortOptions = [
        { label: 'Most recently posted', value: 'recent' },
        { label: 'Nearest deadline first', value: 'deadline_soon' },
        { label: 'Past deadlines', value: 'deadline_ended' },
        { label: 'Not Applied yet', value: 'not_applied' },
    ];

    const targets = [
        { id: 'undergrad', label: 'Undergrad' },
        { id: 'freshgrad', label: 'Freshgrad' },
    ];

    // Helper to determine if a chip is active based on the 'target' filter value
    const isTargetActive = (targetId) => {
        if (filters.target === 'both') return true;
        if (filters.target === 'all') return false;
        return filters.target === targetId;
    };

    const toggleTarget = (targetId) => {
        let newValue;
        const currentTarget = filters.target;

        if (currentTarget === 'both') {
            newValue = targetId === 'undergrad' ? 'freshgrad' : 'undergrad';
        } else if (currentTarget === 'all') {
            newValue = targetId;
        } else if (currentTarget === targetId) {
            newValue = 'all';
        } else {
            newValue = 'both';
        }

        onFilterChange({ target: { name: 'target', value: newValue } });
    };

    return (
        <aside className="w-full md:w-72 flex flex-col gap-6">
            <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl border border-gray-200 dark:border-slate-700/50 shadow-lg dark:shadow-none">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-xl text-gray-900 dark:text-slate-100 flex items-center gap-2.5">
                        <Filter size={20} className="text-blue-500" />
                        Filters
                    </h3>
                    <button
                        onClick={onClearAll}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200 flex items-center gap-1 group"
                    >
                        <X size={14} className="group-hover:rotate-90 transition-transform duration-200" />
                        Clear All
                    </button>
                </div>

                <div className="flex flex-col gap-8">
                    {/* Industry Dropdown */}
                    <CustomDropdown
                        label="Industry"
                        name="industry"
                        value={filters.industry}
                        options={industries}
                        onChange={onFilterChange}
                    />

                    {/* Sort Dropdown */}
                    <CustomDropdown
                        label="Sort by"
                        name="sort"
                        value={filters.sort}
                        options={sortOptions}
                        onChange={onFilterChange}
                    />

                    {/* Target Multi-select Chip Grid */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                            Target Audience
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {targets.map((target) => {
                                const active = isTargetActive(target.id);
                                return (
                                    <button
                                        key={target.id}
                                        onClick={() => toggleTarget(target.id)}
                                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                                            active
                                                ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                                                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-blue-500 dark:hover:border-slate-600 hover:text-blue-600 dark:hover:text-slate-300 shadow-sm dark:shadow-none'
                                        }`}
                                    >
                                        {target.label}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-slate-500 mt-2 italic">
                            Select none for all results
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default SidebarFilters;
