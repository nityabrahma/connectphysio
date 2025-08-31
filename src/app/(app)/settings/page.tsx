// This file is no longer needed as its content has been merged into the Profile page.
// This preserves the route for any deep links but should ideally be removed if not needed.
import { redirect } from 'next/navigation';

export default function SettingsPage() {
    redirect('/profile');
}
