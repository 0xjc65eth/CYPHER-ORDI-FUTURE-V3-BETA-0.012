'use client'

import React, { useState } from 'react'
import { ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw, Bug, ChevronDown, ChevronUp, MessageSquare, Copy, Check } from 'lucide-react'

interface ErrorFallbackUIProps {
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
  level: 'page' | 'component' | 'critical'
  componentName: string
  retryCount: number
  maxRetries: number
  onRetry: () => void
  onReportFeedback: (feedback: string) => void
  canRetry: boolean
}

export function ErrorFallbackUI({
  error,
  errorInfo,
  errorId,
  level,
  componentName,
  retryCount,
  maxRetries,
  onRetry,
  onReportFeedback,
  canRetry
}: ErrorFallbackUIProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleFeedbackSubmit = async () => {
    if (feedback.trim()) {
      onReportFeedback(feedback.trim())
      setFeedbackSubmitted(true)
      setFeedback('')
      setTimeout(() => setFeedbackSubmitted(false), 3000)
    }
  }

  const copyErrorDetails = async () => {
    const errorDetails = `
Error ID: ${errorId}
Component: ${componentName}
Level: ${level}
Message: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
Timestamp: ${new Date().toISOString()}
    `.trim()

    try {
      await navigator.clipboard.writeText(errorDetails)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy error details:', err)
    }
  }

  const getErrorSeverityStyle = () => {
    switch (level) {
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20'
      case 'page':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
      case 'component':
      default:
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
    }
  }

  const getErrorIcon = () => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="w-8 h-8 text-red-500" />
      case 'page':
        return <AlertTriangle className="w-6 h-6 text-orange-500" />
      case 'component':
      default:
        return <Bug className="w-5 h-5 text-yellow-500" />
    }
  }

  const getErrorTitle = () => {
    switch (level) {
      case 'critical':
        return 'Critical System Error'
      case 'page':
        return 'Page Error'
      case 'component':
      default:
        return `${componentName} Error`
    }
  }

  const getErrorMessage = () => {
    if (level === 'critical') {
      return 'A critical error has occurred. Please refresh the page or contact support if the problem persists.'
    }
    if (level === 'page') {
      return 'This page encountered an error and could not be displayed properly.'
    }
    return `The ${componentName} component encountered an error and could not be rendered.`
  }

  return (
    <div className={`rounded-lg border-2 p-6 max-w-4xl mx-auto my-4 ${getErrorSeverityStyle()}`}>
      {/* Header */}
      <div className="flex items-start space-x-3 mb-4">
        {getErrorIcon()}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {getErrorTitle()}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {getErrorMessage()}
          </p>
          {errorId && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
              Error ID: {errorId}
            </p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error?.message && (
        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
          <p className="text-sm font-mono text-gray-800 dark:text-gray-200">
            {error.message}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {canRetry && (
          <button
            onClick={onRetry}
            disabled={retryCount >= maxRetries}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>
              Retry {retryCount > 0 && `(${retryCount}/${maxRetries})`}
            </span>
          </button>
        )}

        <button
          onClick={() => window.location.reload()}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload Page</span>
        </button>

        <button
          onClick={copyErrorDetails}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied!' : 'Copy Details'}</span>
        </button>
      </div>

      {/* Feedback Section */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Help us improve by describing what you were doing when this error occurred:
        </label>
        <div className="flex space-x-2">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Describe what happened before the error..."
            className="flex-1 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
            rows={2}
            maxLength={500}
          />
          <button
            onClick={handleFeedbackSubmit}
            disabled={!feedback.trim() || feedbackSubmitted}
            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {feedbackSubmitted ? (
              <Check className="w-4 h-4" />
            ) : (
              <MessageSquare className="w-4 h-4" />
            )}
          </button>
        </div>
        {feedbackSubmitted && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Thank you for your feedback!
          </p>
        )}
      </div>

      {/* Technical Details (Collapsible) */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          {showDetails ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          <span>Technical Details</span>
        </button>

        {showDetails && (
          <div className="mt-3 space-y-3">
            {error?.stack && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Stack Trace:
                </h4>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-32 font-mono text-gray-800 dark:text-gray-200">
                  {error.stack}
                </pre>
              </div>
            )}

            {errorInfo?.componentStack && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Component Stack:
                </h4>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-32 font-mono text-gray-800 dark:text-gray-200">
                  {errorInfo.componentStack}
                </pre>
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Error Context:
              </h4>
              <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                <p><span className="font-medium">Component:</span> {componentName}</p>
                <p><span className="font-medium">Level:</span> {level}</p>
                <p><span className="font-medium">Retry Count:</span> {retryCount}/{maxRetries}</p>
                <p><span className="font-medium">Timestamp:</span> {new Date().toISOString()}</p>
                <p><span className="font-medium">User Agent:</span> {navigator.userAgent}</p>
                <p><span className="font-medium">URL:</span> {window.location.href}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}