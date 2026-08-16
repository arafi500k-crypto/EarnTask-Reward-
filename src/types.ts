/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Ad {
  id: string;
  title: string;
  sponsor: string;
  imageUrl: string;
  duration: number; // in seconds
  rewardAmount: number; // in Taka, e.g. 19
  description: string;
  actionText: string;
}

export type ViewState = 'dashboard' | 'active-account' | 'ad-watching';

export interface TransactionMock {
  senderNumber: string;
  trxId: string;
  amount: number;
  date: string;
  status: 'pending' | 'rejected' | 'approved';
}
