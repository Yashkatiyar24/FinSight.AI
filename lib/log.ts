// Request-scoped logging utility

interface LogContext {
  route?: string
  user_id?: string
  file_id?: string
  step?: string
  message: string
  level?: 'info' | 'warn' | 'error' | 'debug'
  data?: any
}

export function log(context: LogContext) {
  const timestamp = new Date().toISOString()
  const level = context.level || 'info'
  
  const logData = {
    timestamp,
    level,
    route: context.route,
    user_id: context.user_id,
    file_id: context.file_id,
    step: context.step,
    message: context.message,
    ...(context.data && { data: context.data })
  }

  if (level === 'error') {
    console.error('[FinSight]', JSON.stringify(logData, null, 2))
  } else if (level === 'warn') {
    console.warn('[FinSight]', JSON.stringify(logData, null, 2))
  } else if (level === 'debug' && process.env.NODE_ENV === 'development') {
    console.debug('[FinSight]', JSON.stringify(logData, null, 2))
  } else {
    console.log('[FinSight]', JSON.stringify(logData, null, 2))
  }
}

export function createLogger(baseContext: Partial<Omit<LogContext, 'message'>>) {
  return (context: Omit<LogContext, keyof typeof baseContext> & Pick<LogContext, 'message'>) => {
    log({ ...baseContext, ...context })
  }
}
