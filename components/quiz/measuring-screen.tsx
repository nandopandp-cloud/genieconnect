import { Mascot } from "@/components/mascot";

interface Props { message: string; subMessage?: string; pills?: string[]; }

export function MeasuringScreen({ message, subMessage, pills }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="mb-6 animate-bounce" style={{ animationDuration: "2s" }}>
        <Mascot size={160} />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{message}</h2>
      {subMessage && <p className="text-gray-500 text-base max-w-md">{subMessage}</p>}
      {pills && (
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {pills.map((p) => (
            <span key={p} className="px-4 py-2 bg-white rounded-full text-sm text-gray-500 border border-gray-200 shadow-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-gray-300 mr-2 animate-pulse" />
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
