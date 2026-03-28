import { motion } from 'framer-motion';

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200/50 rounded-lg ${className}`} />
);

export const CardSkeleton = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 p-6"
  >
    <Skeleton className="h-6 w-1/3 mb-4 rounded-lg" />
    <Skeleton className="h-4 w-full mb-2 rounded-lg" />
    <Skeleton className="h-4 w-2/3 rounded-lg" />
  </motion.div>
);

export const ListSkeleton = ({ count = 3 }) => (
  <div className="space-y-3">
    {[...Array(count)].map((_, i) => (
      <motion.div 
        key={i}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.1 }}
        className="flex items-center gap-4 p-4 bg-white/50 rounded-xl border border-white/30"
      >
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-1/3 mb-2 rounded-lg" />
          <Skeleton className="h-3 w-1/2 rounded-lg" />
        </div>
      </motion.div>
    ))}
  </div>
);

export const StatsSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <motion.div 
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 p-6"
      >
        <Skeleton className="h-4 w-20 mb-2 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </motion.div>
    ))}
  </div>
);

export const PageSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48 rounded-lg" />
      <Skeleton className="h-6 w-20 rounded-lg" />
    </div>
    <StatsSkeleton />
    <CardSkeleton />
  </div>
);