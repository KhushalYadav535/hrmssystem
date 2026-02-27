import { redirect } from 'next/navigation';

export default function TaxProofVerificationRedirectPage() {
  redirect('/tax/declarations');
}

