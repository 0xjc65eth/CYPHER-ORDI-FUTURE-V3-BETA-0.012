/**
 * Error Boundary Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, PageErrorBoundary, withErrorBoundary } from '@/components/error/ErrorBoundary';
import React from 'react';

// Component that throws an error
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>No error</div>;
};

// Mock console.error to avoid noise in tests
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('ErrorBoundary', () => {
  beforeEach(() => {
    mockConsoleError.mockClear();
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/COMPONENT ERROR/i)).toBeInTheDocument();
    expect(screen.getByText(/component failed to render/i)).toBeInTheDocument();
  });

  it('should render page-level error for page boundary', () => {
    render(
      <ErrorBoundary level="page">
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/SYSTEM ERROR/i)).toBeInTheDocument();
    expect(screen.getByText(/application encountered an unexpected error/i)).toBeInTheDocument();
  });

  it('should show retry button and handle retry', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const retryButton = screen.getByText(/RETRY/i);
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    // After retry, error should still be there since component still throws
    expect(screen.getByText(/COMPONENT ERROR/i)).toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('should show error details when showDetails is true', () => {
    render(
      <ErrorBoundary showDetails={true}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const CustomFallback = <div>Custom error fallback</div>;

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
  });

  it('should log error with proper structure', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(mockConsoleError).toHaveBeenCalledWith(
      '🚨 Error Boundary Caught Error:',
      expect.objectContaining({
        error: 'Test error message',
        stack: expect.any(String),
        componentStack: expect.any(String),
        errorId: expect.any(String),
        level: 'component',
        timestamp: expect.any(String)
      })
    );
  });
});

describe('PageErrorBoundary', () => {
  it('should render page-level error boundary', () => {
    render(
      <PageErrorBoundary>
        <ThrowError />
      </PageErrorBoundary>
    );

    expect(screen.getByText(/SYSTEM ERROR/i)).toBeInTheDocument();
    expect(screen.getByText(/GO TO DASHBOARD/i)).toBeInTheDocument();
  });
});

describe('withErrorBoundary HOC', () => {
  it('should wrap component with error boundary', () => {
    const TestComponent = () => <div>Test component</div>;
    const WrappedComponent = withErrorBoundary(TestComponent);

    render(<WrappedComponent />);
    expect(screen.getByText('Test component')).toBeInTheDocument();
  });

  it('should catch errors in wrapped component', () => {
    const WrappedThrowError = withErrorBoundary(ThrowError);

    render(<WrappedThrowError />);
    expect(screen.getByText(/COMPONENT ERROR/i)).toBeInTheDocument();
  });

  it('should use custom error boundary props', () => {
    const onError = vi.fn();
    const WrappedThrowError = withErrorBoundary(ThrowError, { 
      onError, 
      level: 'feature' 
    });

    render(<WrappedThrowError />);
    
    expect(onError).toHaveBeenCalled();
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        level: 'feature'
      })
    );
  });
});

describe('Error Boundary Bloomberg Terminal Styling', () => {
  it('should have proper Bloomberg Terminal styling', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const errorContainer = screen.getByText(/COMPONENT ERROR/i).closest('div');
    expect(errorContainer).toHaveClass('bg-gray-900');
    expect(errorContainer).toHaveClass('border-red-500/30');
  });

  it('should show Bloomberg Terminal footer', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/CYPHER ORDi.*Error Recovery System/i)).toBeInTheDocument();
  });
});