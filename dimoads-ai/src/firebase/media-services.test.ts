import { describe, expect, it } from 'vitest';
import { createLocalMediaUrl } from './media-services';

describe('createLocalMediaUrl', () => {
  it('creates a data URL for uploaded files', async () => {
    const file = new File(['hello world'], 'sample.png', { type: 'image/png' });

    const url = await createLocalMediaUrl(file);

    expect(url).toContain('data:image/png;base64,');
  });
});
