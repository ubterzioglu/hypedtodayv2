export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">hyped.today</h1>
          <p className="text-muted-foreground text-sm mt-1">Engagement Exchange for LinkedIn</p>
        </div>
        {children}
      </div>
    </div>
  );
}
