import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redirect to cover letter page by default
  redirect('/dashboard/cover-letter');
}
