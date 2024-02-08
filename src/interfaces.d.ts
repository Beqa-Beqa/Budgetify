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