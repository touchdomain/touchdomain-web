// Split out from generate.ts so client components can import TD_BANKING
// (plain data, no runtime cost) without statically pulling in jsPDF —
// generate.ts is meant to be dynamic-imported only when a PDF is actually
// being produced.

export interface BankingDetails {
  bank: string;
  holder: string;
  account: string;
  branch: string;
  accountType?: string;
  swift?: string;
}

/** Default banking block — override per-invoice via InvoiceData.banking. */
export const TD_BANKING: BankingDetails = {
  bank: 'Standard Bank',
  holder: 'Touch Domain',
  account: '10286525788',
  branch: '051001', // universal / electronic-payments branch code
  accountType: 'MyMoBiz Current Account',
  swift: 'SBZAZAJJ',
};
