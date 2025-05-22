import { Loader2 } from 'lucide-react';

type LoaderProps = {
  size?: number;
  text?: string;
};

export default function Loader({
  size = 24,
  text = 'Loading...',
}: LoaderProps) {
  return (
    <div className="flex items-center justify-center p-6 text-gray-500">
      <Loader2 className="animate-spin" width={size} height={size} />
      <span className="ml-2 text-sm">{text}</span>
    </div>
  );
}
