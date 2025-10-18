// Error handling and user feedback system for FinSight.AI
import { toast } from 'sonner'

export interface ErrorDetails {
  code?: string
  message: string
  context?: string
  timestamp: string
  userId?: string
  action?: string
}

export interface SuccessDetails {
  message: string
  context?: string
  timestamp: string
  userId?: string
  action?: string
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private userId?: string

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  // File upload errors
  handleFileUploadError(error: Error, fileName: string): ErrorDetails {
    const errorDetails: ErrorDetails = {
      code: 'FILE_UPLOAD_ERROR',
      message: `Failed to upload ${fileName}: ${error.message}`,
      context: 'file_upload',
      timestamp: new Date().toISOString(),
      userId: this.userId,
      action: 'upload_file'
    }

    this.logError(errorDetails)
    this.showUserError(errorDetails)
    
    return errorDetails
  }

  // File processing errors
  handleFileProcessingError(error: Error, fileName: string): ErrorDetails {
    const errorDetails: ErrorDetails = {
      code: 'FILE_PROCESSING_ERROR',
      message: `Failed to process ${fileName}: ${error.message}`,
      context: 'file_processing',
      timestamp: new Date().toISOString(),
      userId: this.userId,
      action: 'process_file'
    }

    this.logError(errorDetails)
    this.showUserError(errorDetails)
    
    return errorDetails
  }

  // Database errors
  handleDatabaseError(error: Error, operation: string): ErrorDetails {
    const errorDetails: ErrorDetails = {
      code: 'DATABASE_ERROR',
      message: `Database operation failed (${operation}): ${error.message}`,
      context: 'database',
      timestamp: new Date().toISOString(),
      userId: this.userId,
      action: operation
    }

    this.logError(errorDetails)
    this.showUserError(errorDetails)
    
    return errorDetails
  }

  // Authentication errors
  handleAuthError(error: Error, action: string): ErrorDetails {
    const errorDetails: ErrorDetails = {
      code: 'AUTH_ERROR',
      message: `Authentication failed (${action}): ${error.message}`,
      context: 'authentication',
      timestamp: new Date().toISOString(),
      userId: this.userId,
      action
    }

    this.logError(errorDetails)
    this.showUserError(errorDetails)
    
    return errorDetails
  }

  // Payment errors
  handlePaymentError(error: Error, action: string): ErrorDetails {
    const errorDetails: ErrorDetails = {
      code: 'PAYMENT_ERROR',
      message: `Payment failed (${action}): ${error.message}`,
      context: 'payment',
      timestamp: new Date().toISOString(),
      userId: this.userId,
      action
    }

    this.logError(errorDetails)
    this.showUserError(errorDetails)
    
    return errorDetails
  }

  // API errors
  handleApiError(error: Error, endpoint: string): ErrorDetails {
    const errorDetails: ErrorDetails = {
      code: 'API_ERROR',
      message: `API call failed (${endpoint}): ${error.message}`,
      context: 'api',
      timestamp: new Date().toISOString(),
      userId: this.userId,
      action: endpoint
    }

    this.logError(errorDetails)
    this.showUserError(errorDetails)
    
    return errorDetails
  }

  // Validation errors
  handleValidationError(error: Error, field: string): ErrorDetails {
    const errorDetails: ErrorDetails = {
      code: 'VALIDATION_ERROR',
      message: `Validation failed (${field}): ${error.message}`,
      context: 'validation',
      timestamp: new Date().toISOString(),
      userId: this.userId,
      action: `validate_${field}`
    }

    this.logError(errorDetails)
    this.showUserError(errorDetails)
    
    return errorDetails
  }

  // Generic error handler
  handleGenericError(error: Error, context: string, action?: string): ErrorDetails {
    const errorDetails: ErrorDetails = {
      code: 'GENERIC_ERROR',
      message: error.message,
      context,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      action
    }

    this.logError(errorDetails)
    this.showUserError(errorDetails)
    
    return errorDetails
  }

  // Success handlers
  showSuccess(message: string, context?: string, action?: string) {
    const successDetails: SuccessDetails = {
      message,
      context,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      action
    }

    this.logSuccess(successDetails)
    this.showUserSuccess(successDetails)
  }

  // File upload success
  showFileUploadSuccess(fileName: string, transactionCount: number) {
    this.showSuccess(
      `Successfully processed ${transactionCount} transactions from ${fileName}`,
      'file_upload',
      'upload_file'
    )
  }

  // Report generation success
  showReportSuccess(reportType: string, format: string) {
    this.showSuccess(
      `${reportType} report generated successfully in ${format.toUpperCase()} format`,
      'report_generation',
      'generate_report'
    )
  }

  // Payment success
  showPaymentSuccess(planName: string) {
    this.showSuccess(
      `Successfully upgraded to ${planName} plan!`,
      'payment',
      'upgrade_plan'
    )
  }

  // Rule creation success
  showRuleSuccess(action: string, ruleName: string) {
    this.showSuccess(
      `Rule "${ruleName}" ${action} successfully`,
      'rules',
      `${action}_rule`
    )
  }

  // Private methods
  private logError(errorDetails: ErrorDetails) {
    console.error('Error:', errorDetails)
    
    // In production, you would send this to an error tracking service
    // like Sentry, LogRocket, or your own logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: send to error tracking service
      // errorTrackingService.captureException(errorDetails)
    }
  }

  private logSuccess(successDetails: SuccessDetails) {
    console.log('Success:', successDetails)
    
    // In production, you might want to log successes for analytics
    if (process.env.NODE_ENV === 'production') {
      // Example: send to analytics service
      // analyticsService.track('success', successDetails)
    }
  }

  private showUserError(errorDetails: ErrorDetails) {
    // Show user-friendly error messages
    let userMessage = errorDetails.message

    // Customize messages based on error type
    switch (errorDetails.code) {
      case 'FILE_UPLOAD_ERROR':
        userMessage = 'Failed to upload file. Please check the file format and try again.'
        break
      case 'FILE_PROCESSING_ERROR':
        userMessage = 'Failed to process file. Please ensure the file contains valid transaction data.'
        break
      case 'DATABASE_ERROR':
        userMessage = 'A database error occurred. Please try again in a few moments.'
        break
      case 'AUTH_ERROR':
        userMessage = 'Authentication failed. Please sign in again.'
        break
      case 'PAYMENT_ERROR':
        userMessage = 'Payment failed. Please check your payment details and try again.'
        break
      case 'API_ERROR':
        userMessage = 'A network error occurred. Please check your connection and try again.'
        break
      case 'VALIDATION_ERROR':
        userMessage = 'Please check your input and try again.'
        break
      default:
        userMessage = 'An unexpected error occurred. Please try again.'
    }

    toast.error(userMessage, {
      description: errorDetails.context ? `Context: ${errorDetails.context}` : undefined,
      duration: 5000
    })
  }

  private showUserSuccess(successDetails: SuccessDetails) {
    toast.success(successDetails.message, {
      description: successDetails.context ? `Context: ${successDetails.context}` : undefined,
      duration: 3000
    })
  }
}

// Utility functions for common error scenarios
export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  errorHandler: (error: Error) => void,
  fallback?: T
): Promise<T | undefined> => {
  try {
    return await asyncFn()
  } catch (error) {
    errorHandler(error instanceof Error ? error : new Error(String(error)))
    return fallback
  }
}

export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorHandler: (error: Error) => void
) => {
  return async (...args: T): Promise<R | undefined> => {
    try {
      return await fn(...args)
    } catch (error) {
      errorHandler(error instanceof Error ? error : new Error(String(error)))
      return undefined
    }
  }
}

// React hook for error handling
export const useErrorHandler = () => {
  const errorHandler = ErrorHandler.getInstance()
  
  return {
    handleFileUploadError: errorHandler.handleFileUploadError.bind(errorHandler),
    handleFileProcessingError: errorHandler.handleFileProcessingError.bind(errorHandler),
    handleDatabaseError: errorHandler.handleDatabaseError.bind(errorHandler),
    handleAuthError: errorHandler.handleAuthError.bind(errorHandler),
    handlePaymentError: errorHandler.handlePaymentError.bind(errorHandler),
    handleApiError: errorHandler.handleApiError.bind(errorHandler),
    handleValidationError: errorHandler.handleValidationError.bind(errorHandler),
    handleGenericError: errorHandler.handleGenericError.bind(errorHandler),
    showSuccess: errorHandler.showSuccess.bind(errorHandler),
    showFileUploadSuccess: errorHandler.showFileUploadSuccess.bind(errorHandler),
    showReportSuccess: errorHandler.showReportSuccess.bind(errorHandler),
    showPaymentSuccess: errorHandler.showPaymentSuccess.bind(errorHandler),
    showRuleSuccess: errorHandler.showRuleSuccess.bind(errorHandler)
  }
}

// Global error boundary for React
export class GlobalErrorBoundary extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message)
    this.name = 'GlobalErrorBoundary'
  }
}

// Error types for better type safety
export enum ErrorType {
  FILE_UPLOAD = 'FILE_UPLOAD_ERROR',
  FILE_PROCESSING = 'FILE_PROCESSING_ERROR',
  DATABASE = 'DATABASE_ERROR',
  AUTH = 'AUTH_ERROR',
  PAYMENT = 'PAYMENT_ERROR',
  API = 'API_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  GENERIC = 'GENERIC_ERROR'
}

export const createError = (type: ErrorType, message: string, context?: string): Error => {
  const error = new Error(message)
  error.name = type
  ;(error as any).context = context
  return error
}
