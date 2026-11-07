import { render, screen } from '@testing-library/react';
import Home from '../../app/page';
import { getAllStories } from '../../src/utils/stories';
import type { Story } from '../../types/Story';

jest.mock('../../src/utils/stories', () => ({
  getAllStories: jest.fn(),
  getHomepageStories: (stories: Story[]) => ({ data: stories }),
}));
jest.mock('../../src/components/home/Hero', () => ({
  __esModule: true, default: () => <div>News hero</div>,
}));
jest.mock('../../src/components/home/StoriesSection', () => ({
  __esModule: true, default: () => <div>News stories</div>,
}));
jest.mock('../../src/components/ads/AdSense', () => ({ AdSenseLeaderboard: () => null }));

it('renders an honest empty state instead of sample news or an empty hero', async () => {
  (getAllStories as jest.Mock).mockResolvedValue([]);
  render(await Home());
  expect(screen.getByRole('heading', { name: 'Stories are currently unavailable' })).toBeInTheDocument();
  expect(screen.getByText(/Please check back later/)).toBeInTheDocument();
  expect(screen.queryByText('News hero')).not.toBeInTheDocument();
  expect(screen.queryByText('News stories')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Explore Categories/ })).toBeInTheDocument();
});

it('continues rendering real stories when available', async () => {
  (getAllStories as jest.Mock).mockResolvedValue([{ id: 'real-story' }]);
  render(await Home());
  expect(screen.getByText('News hero')).toBeInTheDocument();
  expect(screen.getByText('News stories')).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Stories are currently unavailable' })).not.toBeInTheDocument();
});
