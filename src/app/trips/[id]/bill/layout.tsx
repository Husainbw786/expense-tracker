export default function BillLayout({ children }: { children: React.ReactNode }) {
  // Break out of the root max-w-md wrapper so the bill can be full width
  return (
    <div
      className="min-h-screen bg-white"
      style={{ marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)", width: "100vw" }}
    >
      {children}
    </div>
  );
}
