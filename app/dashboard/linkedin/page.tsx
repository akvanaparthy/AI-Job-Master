import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LinkedInPage() {
  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">LinkedIn Message Generator</h1>
        <p className="text-muted-foreground mt-2">
          Craft personalized LinkedIn outreach messages
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            The LinkedIn message generator is under construction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This feature will allow you to create professional LinkedIn outreach messages
            and track follow-ups with recruiters.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
