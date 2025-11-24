import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EmailPage() {
  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Email Generator</h1>
        <p className="text-muted-foreground mt-2">
          Generate professional job application emails
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            The email generator is under construction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This feature will generate complete job application emails with
            subject lines and body content.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
