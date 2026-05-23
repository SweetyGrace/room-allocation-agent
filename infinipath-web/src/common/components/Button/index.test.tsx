// import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import  {Button}  from './index';

describe('Button Component', () => {

  test('fires onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies non-active style when `isNonActive` is true', () => {
    render(<Button isNonActive>Non Active</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toMatch(/nonActiveButton/);
  });

  test('applies lessPadding style when `lessPadding` is true', () => {
    render(<Button lessPadding>Less Padding</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toMatch(/lessPadding/);
  });

  test('applies custom button class and text class', () => {
    render(
      <Button
        buttonClassName="custom-button"
        buttonTextClassName="custom-text"
      >
        Styled
      </Button>
    );
    const button = screen.getByRole('button');
    const span = screen.getByText('Styled');
    expect(button.className).toContain('custom-button');
    expect(span.className).toContain('custom-text');
  });
});
