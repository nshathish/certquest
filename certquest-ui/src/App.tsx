import ScreenShotUploader from './components/ScreenShotUploader.tsx';

export default function App() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600">CERTQUEST</h1>
      <div className="mt-4 w-full  text-gray-700">
        <ScreenShotUploader />
      </div>
    </div>
  );
}
