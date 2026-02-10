export function Timer({ seconds }: { seconds: number }) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formatted = `${minutes}:${secs.toString().padStart(2, "0")}`;

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center bg-primary/10 text-primary px-24 py-12 rounded-medium">
        <span className="text-20 font-medium">{formatted}</span>
      </div>
    </div>
  );
}
