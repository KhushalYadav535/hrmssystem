'use client';

import { redirect } from 'next/navigation';

/**
 * /profile-updates redirects to /approvals/profile-update
 * This page exists for backward compatibility and direct URL navigation
 */
export default function ProfileUpdatesPage() {
  redirect('/approvals/profile-update');
}
