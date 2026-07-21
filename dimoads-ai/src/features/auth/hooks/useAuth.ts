/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAuth as useAuthFromProvider } from '../AuthProvider';
export type { AccountType } from '../AuthProvider';

export function useAuth() {
  return useAuthFromProvider();
}
