import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HistoryPage() {
  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Outreach History</h1>
        <p className="text-muted-foreground mt-2">
          Track all your job applications and outreach
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            The outreach history tracker is under construction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This feature will allow you to view and manage all your sent messages,
            filter by status, and generate follow-ups.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
