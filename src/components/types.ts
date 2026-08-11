export interface UiAccount {
  id: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'INCOME' | 'EXPENSE';
  balance: number;
  currency: string;
  color?: string | null;
}

export interface UiBudgetMeter {
  id: string;
  name: string;
  color: string;
  icon: string;
  spent: number;
  cap: number;
  percentage: number;
}

export interface UiWishlistItem {
  id: string;
  title: string;
  amount: number;
  status: 'WAITING' | 'PURCHASED' | 'PASSED';
}

export interface UiTransactionTag {
  id: string;
  name: string;
}

export interface UiTransactionCategory {
  id: string;
  name: string;
  color?: string | null;
  icon?: string | null;
}

export interface UiTransactionAccount {
  id: string;
  name: string;
}

export interface UiTransaction {
  id: string;
  amount: number;
  description: string;
  date: string | Date;
  status: 'UNREVIEWED' | 'CONFIRMED' | 'FLAGGED';
  intent: 'NEED' | 'WANT' | 'INVESTMENT';
  mood?: string | null;
  category?: UiTransactionCategory | null;
  fromAccount: UiTransactionAccount;
  toAccount?: UiTransactionAccount | null;
  tags: UiTransactionTag[];
}
