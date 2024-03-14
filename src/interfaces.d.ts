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
  name: string,
  path: string,
  type: string,
  size: number
}

declare interface CategoryData {
  _id: string,
  owner: string,
  transactionType: string,
  title: string
}

declare interface SubscriptionData {
  _id: string,
  belongsToAccountWithId: string,
  title: string,
  chosenCategories: string[],
  amount: string,
  dateRange: [Date | null, Date | null],
  startDate: string,
  endDate: string,
  description?: string
}

declare interface InputBasicAlert {
  error: boolean,
  text: string
}