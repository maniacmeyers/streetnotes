export default function LuminousDivider({ className = "" }: { className?: string }) {
  return (
    <div
      role="separator"
      className={className}
      style={{
        height: "1px",
        background:
          "linear-gradient(90deg, transparent 0%, rgba(126,212,247,0.2) 50%, transparent 100%)",
        border: "none",
      }}
    />
  );
}
