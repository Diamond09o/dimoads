import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import SearchBar from './SearchBar';
import { SearchFilterProvider } from '../context/SearchFilterContext';
import { matchesCountryFilter } from '../../../global/languages/countries';

describe('SearchBar', () => {
  it('falls back to English copy for unsupported languages', () => {
    render(
      <SearchFilterProvider>
        <SearchBar
          onSearch={() => undefined}
          onClear={() => undefined}
          language="fr"
        />
      </SearchFilterProvider>
    );

    expect(screen.getByPlaceholderText(/search listings/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /^search$/i })).toBeTruthy();
  });

  it('matches listings by country name and country code', () => {
    expect(matchesCountryFilter('Luxury villa in Dubai, UAE', 'AE')).toBe(true);
    expect(matchesCountryFilter('Apartment in Cairo, Egypt', 'egypt')).toBe(true);
    expect(matchesCountryFilter('Studio in Riyadh', 'Saudi Arabia')).toBe(true);
    expect(matchesCountryFilter('Flat in London', 'France')).toBe(false);
  });
});
