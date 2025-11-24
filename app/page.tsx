import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">AI Job Master</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Generate personalized cover letters, LinkedIn messages, and emails using AI.
            Track your job applications all in one place.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 pt-8">
          <Card>
            <CardHeader>
              <CardTitle>Cover Letters</CardTitle>
              <CardDescription>
                Generate tailored cover letters based on job descriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Upload your resume, paste the job description, and let AI create a professional cover letter.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>LinkedIn Outreach</CardTitle>
              <CardDescription>
                Craft personalized LinkedIn messages with follow-up tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create engaging outreach messages and track your conversations with recruiters.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Generator</CardTitle>
              <CardDescription>
                Generate complete job application emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get AI-generated subject lines and email body for your applications.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Key Features List */}
        <Card>
          <CardHeader>
            <CardTitle>Why Choose AI Job Master?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid md:grid-cols-2 gap-3 text-sm">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Support for OpenAI, Anthropic, and Gemini</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Track application status (sent, draft, done, ghost)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Custom AI prompts for each content type</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Manage up to 3 resumes</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Encrypted API key storage</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Export outreach history</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
