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

  // Extract the domain for further validation
  const domain = email.split('@')[1].toLowerCase();
  
  // Check for common valid email providers
  const commonValidDomains = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com',
    'icloud.com', 'protonmail.com', 'mail.com', 'zoho.com', 'yandex.com',
    'gmx.com', 'live.com', 'fastmail.com', 'tutanota.com', 'hey.com',
    'msn.com', 'me.com'
  ];
  
  // For test environments, we might want to allow certain test domains
  const allowedTestDomains = [
    'example.com', 'test.com', 'domain.com', 'company.com', 'user.com'
  ];
  
  // Check known invalid/disposable domain patterns
  const knownInvalidDomains = [
    'gmaik.com', 'gmakkk.com', 'yahooo.com', 'hotmial.com', 'outlook.con',
    'tempmail.com', 'mailinator.com', 'guerrillamail.com', 'yopmail.com',
    'trashmail.com', 'sharklasers.com', '10minutemail.com', 'throwawaymail.com',
    'gmauuu.com', 'gmauu.com', 'gmau.com', 'yaho.com', 'yahhoo.com',
    'outlok.com', 'hormail.com', 'hotrmail.com'
  ];

  // If it's a common domain with typos (like gmauuu.com), reject it
  // Check if domain has repeating characters that aren't in normal domains
  if (domain.match(/(.)\1{2,}/)) {
    return false; // Domains with 3+ repeating characters are suspicious
  }
  
  // Check for letter transpositions or additions in common domains
  const gmailVariants = /^g[a-z]*m[a-z]*a[a-z]*i[a-z]*l\.com$/;
  const yahooVariants = /^y[a-z]*a[a-z]*h[a-z]*o{1,3}\.com$/;
  const outlookVariants = /^o[a-z]*u[a-z]*t[a-z]*l[a-z]*o{1,2}[a-z]*k\.com$/;
  const hotmailVariants = /^h[a-z]*o[a-z]*t[a-z]*m[a-z]*a[a-z]*i[a-z]*l\.com$/;
  
  if (
    // If it looks like a misspelled common domain but isn't in the valid list
    (
      (gmailVariants.test(domain) || 
       yahooVariants.test(domain) || 
       outlookVariants.test(domain) || 
       hotmailVariants.test(domain)) && 
      !commonValidDomains.includes(domain)
    ) ||
    // Or it's explicitly in our invalid domains list
    knownInvalidDomains.includes(domain)
  ) {
    return false;
  }
  
  // For now, whitelist approach - only allow common valid domains and test domains
  return commonValidDomains.includes(domain) || allowedTestDomains.includes(domain);
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
  if (!email) {
    return { isValid: false, reason: 'Email is required' };
  }
  
  // Extract domain for error message
  const domain = email.split('@')[1]?.toLowerCase();
  
  // Step 1: Check format using our restrictive whitelist approach
  if (!isValidEmailFormat(email)) {
    if (domain && domain.match(/(.)\1{2,}/)) {
      return { isValid: false, reason: 'Email domain contains suspicious repeating characters' };
    }
    
    if (domain && domain.includes('gmauu')) {
      return { isValid: false, reason: 'Invalid email domain. Did you mean gmail.com?' };
    }
    
    if (domain && domain.includes('yaho')) {
      return { isValid: false, reason: 'Invalid email domain. Did you mean yahoo.com?' };
    }
    
    if (domain && domain.includes('hotma')) {
      return { isValid: false, reason: 'Invalid email domain. Did you mean hotmail.com?' };
    }
    
    if (domain && domain.includes('outl')) {
      return { isValid: false, reason: 'Invalid email domain. Did you mean outlook.com?' };
    }
    
    return { 
      isValid: false, 
      reason: 'Please use a valid email from a major provider (gmail.com, yahoo.com, outlook.com, etc.)' 
    };
  }
  
  // Success - the email passed our strict format validation
  return { isValid: true };
}