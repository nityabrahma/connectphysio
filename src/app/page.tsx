import { redirect } from 'next/navigation';

export default function HomePage() {
  // This page is now a simple router.
  // In a real app, you might have a landing page here.
  // For this demo, we'll redirect to the login page.
  redirect('/login');
}
