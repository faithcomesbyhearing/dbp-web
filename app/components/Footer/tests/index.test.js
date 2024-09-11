import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Footer from '..';

const props = {
  settingsActive: false,
  profileActive: false,
  searchActive: false,
  notebookActive: false,
  isScrollingDown: false,
  toggleNotebook: jest.fn(),
  toggleSettingsModal: jest.fn(),
  toggleProfile: jest.fn(),
  toggleSearch: jest.fn(),
};

describe('Footer component tests', () => {
  beforeEach(() => {
    // Reset mock functions before each test
    props.toggleNotebook.mockClear();
    props.toggleSettingsModal.mockClear();
    props.toggleProfile.mockClear();
    props.toggleSearch.mockClear();
  });

  it('matches snapshot when open', () => {
    const { container } = render(<Footer {...props} />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot when closed', () => {
    const { container } = render(<Footer {...props} isScrollingDown />);
    expect(container).toMatchSnapshot();
  });

  it('should toggle each setting when clicked', () => {
    render(<Footer {...props} />);

    // Simulate profile button click
    fireEvent.click(screen.getByTitle('Profile'));
    expect(props.toggleProfile).toHaveBeenCalledTimes(1);

    // Simulate search button click
    fireEvent.click(screen.getByTitle('Search'));
    expect(props.toggleSearch).toHaveBeenCalledTimes(1);

    // Simulate notebook button click
    fireEvent.click(screen.getByTitle('Notebook'));
    expect(props.toggleNotebook).toHaveBeenCalledTimes(1);

    // Simulate settings button click
    fireEvent.click(screen.getByTitle('Settings'));
    expect(props.toggleSettingsModal).toHaveBeenCalledTimes(1);
  });
});
