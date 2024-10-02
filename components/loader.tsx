import { Loader } from "lucide-react"; // or another suitable icon

export const LoaderComponent = () => {
  return (
    <div className="h-full flex flex-col gap-y-4 items-center justify-center">
      <div className="w-10 h-10 relative animate-spin">
        <Loader className="w-full h-full" />
      </div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
};
