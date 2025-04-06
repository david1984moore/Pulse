import { promises as dns } from 'dns';

/**
 * Validate email format using more comprehensive approach
 * @param email Email to validate
 */
export function isValidEmailFormat(email: string): boolean {
  // Basic email format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return false;
  }

  // Check known invalid/disposable domain patterns
  const knownInvalidDomains = [
    'gmaik.com', 'gmakkk.com', 'yahooo.com', 'hotmial.com', 'outlook.con',
    'tempmail.com', 'mailinator.com', 'guerrillamail.com', 'yopmail.com',
    'trashmail.com', 'sharklasers.com', '10minutemail.com', 'throwawaymail.com'
  ];

  const domain = email.split('@')[1].toLowerCase();
  if (knownInvalidDomains.includes(domain)) {
    return false;
  }

  return true;
}

/**
 * Performs domain MX record validation in an async way
 * This validates if a domain has mail servers configured
 * 
 * @param email Email to validate
 * @returns Whether the email domain has valid MX records
 */
export async function isValidEmailDomain(email: string): Promise<boolean> {
  try {
    // Extract domain from email
    const domain = email.split('@')[1];
    
    // Resolve MX records to check if the domain can receive email
    const mxRecords = await dns.resolveMx(domain);
    
    // If there are MX records, the domain is set up for email
    return Array.isArray(mxRecords) && mxRecords.length > 0;
  } catch (error) {
    // Domain doesn't exist or doesn't have MX records
    console.error(`Email domain validation failed: ${error}`);
    return false;
  }
}

/**
 * Complete email validation that checks both format and domain
 * 
 * @param email Email to validate
 * @returns Whether the email is valid
 */
export async function validateEmail(email: string): Promise<{ isValid: boolean, reason?: string }> {
  // Step 1: Check format
  if (!isValidEmailFormat(email)) {
    return { isValid: false, reason: 'Invalid email format or known fake domain' };
  }

  // Step 2: Check domain MX records
  try {
    const hasMxRecords = await isValidEmailDomain(email);
    if (!hasMxRecords) {
      return { isValid: false, reason: 'Domain cannot receive emails (no MX records)' };
    }
    
    return { isValid: true };
  } catch (error) {
    console.error('Email validation error:', error);
    // Fall back to format validation only if domain check fails
    return { isValid: true };
  }
}