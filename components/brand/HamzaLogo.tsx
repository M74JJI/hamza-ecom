import Image from "next/image";

export function HamzaLogo({
  size = 48,
  inverted = false,
  priority = false,
}: {
  size?: number;
  inverted?: boolean;
  priority?: boolean;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden"
      style={{ width: size, height: size }}
    >
      <Image
        src="/brand/hamza-logo.png"
        alt="HAMZA"
        width={size}
        height={size}
        priority={priority}
        className={`h-full w-full scale-[1.3] object-contain ${inverted ? "brightness-0 invert" : ""}`}
      />
    </span>
  );
}
