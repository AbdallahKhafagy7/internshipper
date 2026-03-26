const SkeletonCard = () => {
  return (
    <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden animate-pulse flex flex-col md:flex-row">
      {/* Left Section */}
      <div className="flex-1 p-4 md:p-5 flex flex-col gap-3">
        {/* Title & Company Skeleton */}
        <div className="space-y-2 mb-2">
          <div className="h-6 bg-slate-800 rounded w-2/3" />
          <div className="h-4 bg-slate-700 rounded w-1/2" />
        </div>

        {/* Industry & Location Skeleton */}
        <div className="flex gap-6">
          <div className="h-4 bg-slate-800 rounded w-24" />
          <div className="h-4 bg-slate-800 rounded w-28" />
        </div>

        {/* Description Skeleton */}
        <div className="space-y-1 mt-1">
          <div className="h-3 bg-slate-800 rounded w-full" />
          <div className="h-3 bg-slate-800 rounded w-5/6" />
        </div>

        {/* Deadline Skeleton */}
        <div className="h-3 bg-slate-800 rounded w-32" />
      </div>

      {/* Right Section */}
      <div className="flex flex-col gap-2 p-4 md:p-5 bg-slate-900/50 md:bg-transparent border-t md:border-t-0 md:border-l border-slate-800 md:min-w-max">
        {/* Apply Button Skeleton */}
        <div className="h-10 bg-slate-800 rounded-lg w-24" />

        {/* Track Button Skeleton */}
        <div className="h-10 bg-slate-800 rounded-lg w-16" />

        {/* Delete Button Skeleton */}
        <div className="h-10 w-10 bg-slate-800 rounded-lg" />
      </div>
    </div>
  );
};

export default SkeletonCard;
