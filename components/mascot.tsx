import Image from "next/image";

interface MascotProps {
  size?: number;
  className?: string;
}

export function Mascot({ size = 180, className = "" }: MascotProps) {
  return (
    <Image
      src="/geniebot.png"
      alt="GenieBot"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain" }}
      priority
    />
  );
}
