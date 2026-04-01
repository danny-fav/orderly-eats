export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-6xl font-display font-semibold text-primary mb-4">404</h1>
        <p className="text-muted-foreground mb-8">This page doesn't exist.</p>
        <a href="/" className="text-sm font-medium text-primary hover:underline underline-offset-2">← Go home</a>
      </div>
    </div>
  );
}
