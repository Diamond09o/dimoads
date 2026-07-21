import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initialListings, mockUsers } from '../data';
import {
  getPersistedListings,
  getPersistedUsers,
  getCurrentUserId,
  savePersistedListings,
  savePersistedUsers,
  setCurrentUserId,
} from './filePersistence';

describe('file persistence helpers', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });

  it('stores and reloads listings from local storage', () => {
    const updatedListings = [{ ...initialListings[0], title: 'Updated listing title' }];

    savePersistedListings(updatedListings);

    expect(getPersistedListings()).toEqual(updatedListings);
  });

  it('stores and reloads users and current user id', () => {
    const updatedUsers = { ...mockUsers, 'user-99': { ...mockUsers['user-3'], id: 'user-99' } };

    savePersistedUsers(updatedUsers);
    setCurrentUserId('user-99');

    expect(getPersistedUsers()).toEqual(updatedUsers);
    expect(getCurrentUserId()).toBe('user-99');
  });
});
