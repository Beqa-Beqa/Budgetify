declare interface CurrentUserData {
  email: string,
  password: string,
  data: UserData,
  _id: string
}

declare interface UserData {
  name: string,
  _id: string
}

declare interface CurrencyData {
  CountryISOTwoLetterCode: string,
  CountryName: string,
  CountryThreeLetterCode: string,
  CurrencyEnglishName: string,
  CurrencySymbol: string,
  ISOCurrencyCode: string,
  IsEuropeanUnionMember: boolean
}

declare interface AccountData {
  owner: string,
  title: string,
  currency: string,
  amount: string,
  description: string,
  _id: string
}

declare interface TransactionData {
  _id: string,
  id: string,
  belongsToAccountWithId: string,
  transactionType: string,
  title: string,
  amount: string,
  date: string,
  payee: string,
  chosenCategories: string[],
  creationDate: string,
  updateDate: string,
  description?: string,
  files?: TransactionFilesData[]
}

declare interface TransactionFilesData {
  belongsToTransactionWithId: string,
  name: string,
  type: string,
  size: number,
  data: Buffer
}

declare interface CategoryData {
  _id: string,
  owner: string,
  transactionType: string,
  title: string
}

declare interface SubscriptionData {
  _id: string,
  creationDate: string,
  year: number,
  months: number[],
  belongsToAccountWithId: string,
  title: string,
  chosenCategories: string[],
  amount: string,
  dateRange: [Date | null, Date | null],
  startDate: string,
  endDate: string,
  description?: string
}

declare interface PiggyBankData {
  _id: string,
  belongsToAccountWithId: string,
  goal: string,
  goalAmount: string,
  currentAmount: string,
  payments: PiggyBankPayment[]
}

declare interface PiggyBankPayment {
  _id: string,
  date: string,
  amount: string
}

declare interface ObligatoryData {
  _id: string,
  belongsToAccountWithId: string,
  title: string,
  description?: string,
  amount?: string,
  dateRange: [Date | null, Date | null],
  startDate: string,
  endDate: string,
  createdOn: string
}

declare interface InputBasicAlert {
  error: boolean,
  text: string
}