import { render, screen, waitFor, act } from '@testing-library/react';
import Chat from './page';

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ token: 'test-token' }),
  })
) as jest.Mock;

describe('Chat Component', () => {
  beforeEach(() => {
    // Clear mock calls between tests
    (global.fetch as jest.Mock).mockClear();
  });

  it('should render loading state initially', () => {
    render(<Chat />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should fetch token on mount', async () => {
    await act(async () => {
      render(<Chat />);
    });
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/auth/token');
    });
  });

  it('should render chat interface after loading', async () => {
    await act(async () => {
      render(<Chat />);
    });
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Check for main UI elements
    expect(screen.getByRole('combobox')).toBeInTheDocument(); // model select
    expect(screen.getByRole('button', { name: /new chat/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument(); // input
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });
}); 