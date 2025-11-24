import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CoverLetterPage() {
  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Cover Letter Generator</h1>
        <p className="text-muted-foreground mt-2">
          Generate personalized cover letters based on job descriptions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            The cover letter generator is under construction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This feature will allow you to upload your resume, paste a job description,
            and generate a tailored cover letter using AI.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
