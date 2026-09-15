import Image from "next/image";

type LogoProps = {
  className?: string;
  title?: string;
  priority?: boolean;
};

export function Logo({
  className,
  title = "PIPOCRUNCH",
  priority = false,
}: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt={title}
      width={1200}
      height={1200}
      className={className}
      priority={priority}
    />
  );
}
