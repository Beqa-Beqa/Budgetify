import { createContext, useState } from "react";

// Initial context.
export const AuthContext = createContext<{
  currentUserData: CurrentUserData | {},
  setCurrentUserData: React.Dispatch<React.SetStateAction<CurrentUserData | {}>>,
  accountsData: [] | AccountData[],
  setAccountsData: React.Dispatch<React.SetStateAction<[] | AccountData[]>>,
  transactionsData: [] | TransactionData[],
  setTransactionsData: React.Dispatch<React.SetStateAction<[] | TransactionData[]>>,
  categoriesData: [] | CategoryData[],
  setCategoriesData: React.Dispatch<React.SetStateAction<[] | CategoryData[]>>
}>({
  currentUserData: {},
  setCurrentUserData: () => {},
  accountsData: [],
  setAccountsData: () => {},
  transactionsData: [],
  setTransactionsData: () => {},
  categoriesData: [],
  setCategoriesData: () => {}
});

const AuthContextProvider = (props: {children: React.ReactNode}) => {
  const [currentUserData, setCurrentUserData] = useState<CurrentUserData | {}>(JSON.parse(window.sessionStorage.getItem("Budgetify-user-data") || "{}"));
  const [accountsData, setAccountsData] = useState<AccountData[] | []>(JSON.parse(window.sessionStorage.getItem("Budgetify-user-accounts-data") || "{}") || []);
  const [transactionsData, setTransactionsData] = useState<TransactionData[] | []>(JSON.parse(window.sessionStorage.getItem("Budgetify-user-transactions-data") || "{}") || [])
  const [categoriesData, setCategoriesData] = useState<CategoryData[] | []>(JSON.parse(window.sessionStorage.getItem("Budgetify-user-categories-data") || "{}") || []);

  // This context provider, provides currentUserData and accountsData (as well as their setters).

  return <AuthContext.Provider value={{currentUserData, setCurrentUserData, accountsData, setAccountsData, transactionsData, setTransactionsData, categoriesData, setCategoriesData}}>
    {props.children}
  </AuthContext.Provider>
}

export default AuthContextProvider;