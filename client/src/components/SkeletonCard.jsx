const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-lg border border-gray-200 dark:border-slate-700/50 overflow-hidden animate-pulse flex flex-col md:flex-row shadow-sm">
      {/* Left Section */}
      <div className="flex-1 p-4 md:p-5 flex flex-col gap-3">
        {/* Title & Company Skeleton */}
        <div className="space-y-2 mb-2">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-2/3" />
          <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded w-1/2" />
        </div>

        {/* Industry & Location Skeleton */}
        <div className="flex gap-6">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-28" />
        </div>

        {/* Description Skeleton */}
        <div className="space-y-1 mt-1">
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-5/6" />
        </div>

        {/* Deadline Skeleton */}
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-32" />
      </div>

      {/* Right Section */}
      <div className="flex flex-col gap-2 p-4 md:p-5 bg-gray-50 dark:bg-slate-900/50 md:bg-transparent border-t md:border-t-0 md:border-l border-gray-100 dark:border-slate-700/50 md:min-w-[200px]">
        {/* Apply Button Skeleton */}
        <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-lg w-full" />

        {/* Track Button Skeleton */}
        <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-lg w-full" />

        {/* Delete Button Skeleton */}
        <div className="flex gap-2">
          <div className="h-10 flex-1 bg-gray-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-10 flex-1 bg-gray-200 dark:bg-slate-700 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
