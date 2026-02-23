/**
 * Frontend Masking Utilities for Sensitive Data
 * BRD Requirement: Mask sensitive data in UI display
 */

/**
 * Mask Aadhaar number (show only last 4 digits)
 * Format: XXXX-XXXX-1234
 */
export function maskAadhaar(aadhaar: string | null | undefined): string {
  if (!aadhaar || typeof aadhaar !== 'string') {
    return aadhaar || 'N/A';
  }
  
  // Extract digits only
  const digits = aadhaar.replace(/\D/g, '');
  
  if (digits.length !== 12) {
    return aadhaar; // Return as-is if invalid format
  }
  
  // Mask: XXXX-XXXX-1234 (last 4 digits visible)
  return `XXXX-XXXX-${digits.slice(-4)}`;
}

/**
 * Mask account number (show only last 4 digits)
 * Format: XXXX-XXXX-XXXX-1234
 */
export function maskAccountNumber(accountNumber: string | null | undefined): string {
  if (!accountNumber || typeof accountNumber !== 'string') {
    return accountNumber || 'N/A';
  }
  
  // Extract digits only
  const digits = accountNumber.replace(/\D/g, '');
  
  if (digits.length < 4) {
    return accountNumber; // Return as-is if too short
  }
  
  // Mask: Show last 4 digits
  const masked = 'X'.repeat(Math.max(0, digits.length - 4)) + digits.slice(-4);
  
  // Format with dashes for readability (every 4 digits)
  return masked.match(/.{1,4}/g)?.join('-') || masked;
}

/**
 * Mask PAN number (show only last 4 characters)
 * Format: XXXXX1234
 */
export function maskPAN(pan: string | null | undefined): string {
  if (!pan || typeof pan !== 'string') {
    return pan || 'N/A';
  }
  
  // PAN format: ABCDE1234F (5 letters, 4 digits, 1 letter)
  const cleaned = pan.toUpperCase().replace(/\s/g, '');
  
  if (cleaned.length !== 10) {
    return pan; // Return as-is if invalid format
  }
  
  // Mask: XXXXX1234 (last 4 characters visible)
  return 'XXXXX' + cleaned.slice(-4);
}

/**
 * Mask phone number (show only last 4 digits)
 * Format: XXXXXX1234
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone || typeof phone !== 'string') {
    return phone || 'N/A';
  }
  
  // Extract digits only
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length < 4) {
    return phone; // Return as-is if too short
  }
  
  // Mask: Show last 4 digits
  return 'X'.repeat(Math.max(0, digits.length - 4)) + digits.slice(-4);
}

/**
 * Format Aadhaar for display (with masking)
 * Shows: XXXX-XXXX-1234
 */
export function formatAadhaar(aadhaar: string | null | undefined): string {
  return maskAadhaar(aadhaar);
}

/**
 * Format account number for display (with masking)
 * Shows: XXXX-XXXX-XXXX-1234
 */
export function formatAccountNumber(accountNumber: string | null | undefined): string {
  return maskAccountNumber(accountNumber);
}

/**
 * Format PAN for display (with masking)
 * Shows: XXXXX1234
 */
export function formatPAN(pan: string | null | undefined): string {
  return maskPAN(pan);
}
