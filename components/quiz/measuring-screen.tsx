import { Mascot } from "@/components/mascot";

interface Props { message: string; subMessage?: string; pills?: string[]; }

export function MeasuringScreen({ message, subMessage, pills }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Mascot with float */}
      <div className="mb-6 animate-genie-float">
        <Mascot size={160} />
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-fade-up delay-75">
        {message}
      </h2>

      {/* Animated loading dots below the title */}
      <div className="flex items-center justify-center gap-1.5 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 dot-bounce" />
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 dot-bounce" />
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 dot-bounce" />
      </div>

      {subMessage && (
        <p className="text-gray-500 text-base max-w-md animate-fade-up delay-150">
          {subMessage}
        </p>
      )}

      {pills && (
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {pills.map((p, i) => (
            <span
              key={p}
              className="px-4 py-2 bg-white rounded-full text-sm text-gray-500 border border-gray-200 shadow-sm animate-fade-up"
              style={{ animationDelay: `${200 + i * 80}ms` }}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-sky-300 mr-2 animate-pulse" />
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
