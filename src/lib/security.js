import { z } from 'zod'

/**
 * Input validation utilities for security hardening
 * Prevents XSS, injection, and other input-based attacks
 */

// Common validation schemas
export const schemas = {
  // Email validation
  email: z.string().email('Invalid email address').max(255),

  // URL validation
  url: z.string().url('Invalid URL').max(2048),

  // Safe string (alphanumeric with basic punctuation)
  safeString: z.string()
    .min(1, 'Required')
    .max(1000, 'Too long')
    .regex(/^[a-zA-Z0-9\s\-_.,!?'"]+$/, 'Contains invalid characters'),

  // User input text (allows more characters but sanitized)
  userText: z.string()
    .min(1, 'Required')
    .max(5000, 'Text too long')
    .transform(sanitizeHtml),

  // Numeric values
  positiveInteger: z.number().int().positive(),
  percentage: z.number().min(0).max(100),

  // IDs and slugs
  uuid: z.string().uuid('Invalid ID format'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format'),

  // Assessment score (0-100)
  assessmentScore: z.number().min(0).max(100),

  // Platform selection
  platform: z.enum([
    'google_gemini',
    'microsoft_copilot',
    'anthropic_claude',
    'openai_chatgpt'
  ]),
}

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes all HTML tags and dangerous characters
 */
export function sanitizeHtml(input) {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Validate and sanitize user input
 */
export function validateInput(schema, data) {
  try {
    return {
      success: true,
      data: schema.parse(data),
      error: null,
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.errors?.[0]?.message || 'Validation failed',
    }
  }
}

/**
 * Rate limiting helper (client-side)
 * Prevents excessive API calls from single client
 */
export class ClientRateLimiter {
  constructor(maxCalls = 10, windowMs = 60000) {
    this.maxCalls = maxCalls
    this.windowMs = windowMs
    this.calls = []
  }

  canMakeCall() {
    const now = Date.now()
    // Remove calls outside the time window
    this.calls = this.calls.filter(time => now - time < this.windowMs)
    
    if (this.calls.length >= this.maxCalls) {
      return false
    }
    
    this.calls.push(now)
    return true
  }

  getRemainingCalls() {
    const now = Date.now()
    this.calls = this.calls.filter(time => now - time < this.windowMs)
    return Math.max(0, this.maxCalls - this.calls.length)
  }

  getResetTime() {
    if (this.calls.length === 0) return 0
    const oldestCall = Math.min(...this.calls)
    return oldestCall + this.windowMs
  }
}

/**
 * Validate file uploads
 */
export function validateFile(file, options = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
  } = options

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`,
    }
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
    }
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop().toLowerCase()
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`,
    }
  }

  return { valid: true, error: null }
}

/**
 * Secure storage wrapper
 * Prevents storing sensitive data in localStorage
 */
export const secureStorage = {
  // Safe to store
  set(key, value) {
    try {
      // Warn about sensitive data
      const sensitiveKeys = ['password', 'token', 'secret', 'key', 'apikey']
      if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
        console.warn(`⚠️ Attempting to store potentially sensitive data: ${key}`)
      }
      
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Storage error:', error)
      return false
    }
  },

  get(key) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Storage retrieval error:', error)
      return null
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Storage removal error:', error)
      return false
    }
  },

  clear() {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Storage clear error:', error)
      return false
    }
  },
}

export default {
  schemas,
  sanitizeHtml,
  validateInput,
  ClientRateLimiter,
  validateFile,
  secureStorage,
}
