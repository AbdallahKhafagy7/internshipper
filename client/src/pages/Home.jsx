import { useState, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInternships, deleteInternship } from "../api/internships";
import { getMyApplications } from "../api/applications";
import { AuthContext } from "../context/AuthContext";
import InternshipCard from "../components/InternshipCard";
import SkeletonCard from "../components/SkeletonCard";
import { Search } from "lucide-react";

import SidebarFilters from "../components/SidebarFilters";

const Home = () => {
  const { token, user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const initialFilters = {
    search: "",
    industry: "All",
    target: "all",
    sort: "recent",
    page: 1,
  };
  const [filters, setFilters] = useState(initialFilters);

  const { data, isLoading: internshipsLoading } = useQuery({
    queryKey: ["internships", filters],
    queryFn: () => getInternships(filters),
  });

  const internships = data?.internships || [];
  const totalPages = data?.pages || 1;

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => getMyApplications(token),
    enabled: !!token,
  });

  const isLoading = internshipsLoading || (!!token && applicationsLoading);

  const appliedInternshipIds = new Set(
    applications?.map((app) =>
      String(app.internshipId?._id || app.internshipId),
    ) || [],
  );

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteInternship(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries(["internships"]);
    },
  });

  const handleSearchClick = () => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value, page: 1 }));
  };

  const handleClearAll = () => {
    setFilters(initialFilters);
    setSearch("");
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredInternships = internships?.filter((internship) => {
    if (filters.sort === "not_applied") {
      return !appliedInternshipIds.has(String(internship._id));
    }
    return true;
  });

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
      {/* Sidebar Filters */}
      <SidebarFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAll}
      />

      {/* Main Content */}
      <main className="flex-1 space-y-6">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by title or company..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-[#1e293b] border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm dark:shadow-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
          <button
            onClick={handleSearchClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition shadow-md shadow-blue-500/20 active:scale-95"
          >
            Search
          </button>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="space-y-3 w-full">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredInternships?.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
            <p className="text-gray-500 dark:text-slate-400 font-medium">
              No internships found matching your criteria.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 w-full">
              {filteredInternships?.map((internship) => (
                <InternshipCard
                  key={internship._id}
                  internship={internship}
                  isApplied={appliedInternshipIds.has(String(internship._id))}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-6">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-slate-300"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                        filters.page === i + 1
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300 border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-slate-300"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>

  );
};

export default Home;
