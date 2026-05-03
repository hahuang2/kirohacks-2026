import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HintDisplay from '../../components/HintDisplay';

describe('HintDisplay', () => {
  it('renders nothing when hints is empty', () => {
    const { container } = render(<HintDisplay hints={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when hints is null', () => {
    const { container } = render(<HintDisplay hints={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when hints is undefined', () => {
    const { container } = render(<HintDisplay hints={undefined} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the "Hints" heading', () => {
    render(<HintDisplay hints={['Think about using a hash map.']} />);
    expect(screen.getByText('Hints')).toBeInTheDocument();
  });

  it('has an accessible section label', () => {
    render(<HintDisplay hints={['Use a data structure for lookups.']} />);
    expect(
      screen.getByRole('region', { name: /hint display/i })
    ).toBeInTheDocument();
  });

  it('renders a single hint with its number', () => {
    render(<HintDisplay hints={['Consider the complement of each number.']} />);
    expect(screen.getByText('Hint 1:')).toBeInTheDocument();
    expect(
      screen.getByText('Consider the complement of each number.')
    ).toBeInTheDocument();
  });

  it('renders multiple hints in order', () => {
    const hints = [
      'Think about what data structure allows O(1) lookups.',
      'A hash map can store values you have already seen.',
      'For each number, check if target - number exists in the map.',
    ];
    render(<HintDisplay hints={hints} />);

    expect(screen.getByText('Hint 1:')).toBeInTheDocument();
    expect(screen.getByText('Hint 2:')).toBeInTheDocument();
    expect(screen.getByText('Hint 3:')).toBeInTheDocument();

    expect(
      screen.getByText(hints[0])
    ).toBeInTheDocument();
    expect(
      screen.getByText(hints[1])
    ).toBeInTheDocument();
    expect(
      screen.getByText(hints[2])
    ).toBeInTheDocument();
  });

  it('renders hints as an ordered list', () => {
    render(<HintDisplay hints={['First hint', 'Second hint']} />);
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
  });
});
