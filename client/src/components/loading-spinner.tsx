export default function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} animate-spin relative`}>
        <div className="absolute inset-0 border-2 border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 border-2 border-green-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
    </div>
  );
}