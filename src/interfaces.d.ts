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
  amount: number,
  description: string,
  _id: string
}