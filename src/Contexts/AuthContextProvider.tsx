import { createContext, useState } from "react";

// Initial context.
export const AuthContext = createContext<{
  currentUserData: CurrentUserData | {},
  setCurrentUserData: React.Dispatch<React.SetStateAction<CurrentUserData | {}>>,
  accountsData: [] | AccountData[],
  setAccountsData: React.Dispatch<React.SetStateAction<[] | AccountData[]>>
}>({
  currentUserData: {},
  setCurrentUserData: () => {},
  accountsData: [],
  setAccountsData: () => {}
});

const AuthContextProvider = (props: {children: React.ReactNode}) => {
  const [currentUserData, setCurrentUserData] = useState<CurrentUserData | {}>(JSON.parse(window.sessionStorage.getItem("Budgetify-user-data") || "{}"));
  const [accountsData, setAccountsData] = useState<AccountData[] | []>(JSON.parse(window.sessionStorage.getItem("Budgetify-user-accounts-data") || "{}") || []);

  // This context provider, provides currentUserData and accountsData (as well as their setters).

  return <AuthContext.Provider value={{currentUserData, setCurrentUserData, accountsData, setAccountsData}}>
    {props.children}
  </AuthContext.Provider>
}

export default AuthContextProvider;