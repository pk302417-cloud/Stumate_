import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge variant="success">New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Badge variant="error">Alert</Badge>);
    const el = screen.getByText('Alert');
    expect(el.className).toContain('error');
  });
});
