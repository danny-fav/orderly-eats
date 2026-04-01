import { AdminSidebar } from '@/pages/Dashboard';

export default function Settings() {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-64 p-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-display font-semibold mb-8">Settings</h1>
          <div className="bg-card rounded-2xl border border-border/50 p-8 shadow-sm">
            <h2 className="font-display font-semibold mb-4">Restaurant Profile</h2>
            <p className="text-sm text-muted-foreground">Settings and customization options coming soon.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
