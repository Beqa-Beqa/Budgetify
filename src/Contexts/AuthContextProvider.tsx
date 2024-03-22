import { createContext, useState, useEffect } from "react";
import { getGlobalTimeUnix, updateTransactionsData, removeThousandsCommas, updateAccountsData, updateSubscriptionsData, editAccount, editSubscription, createTransaction } from "../Functions";
import {v4 as uuid} from "uuid";

// Initial context.
export const AuthContext = createContext<{
  currentUserData: CurrentUserData | {},
  setCurrentUserData: React.Dispatch<React.SetStateAction<CurrentUserData | {}>>,
  accountsData: AccountData[],
  setAccountsData: React.Dispatch<React.SetStateAction<AccountData[]>>,
  transactionsData: TransactionData[],
  setTransactionsData: React.Dispatch<React.SetStateAction<TransactionData[]>>,
  categoriesData: CategoryData[],
  setCategoriesData: React.Dispatch<React.SetStateAction<CategoryData[]>>
  subscriptionsData: SubscriptionData[],
  setSubscriptionsData: React.Dispatch<React.SetStateAction<SubscriptionData[]>>,
  piggyBanksData: PiggyBankData[],
  setPiggyBanksData: React.Dispatch<React.SetStateAction<PiggyBankData[]>>
  obligatoriesData: ObligatoryData[],
  setObligatoriesData: React.Dispatch<React.SetStateAction<ObligatoryData[]>>
}>({
  currentUserData: {},
  setCurrentUserData: () => {},
  accountsData: [],
  setAccountsData: () => {},
  transactionsData: [],
  setTransactionsData: () => {},
  categoriesData: [],
  setCategoriesData: () => {},
  subscriptionsData: [],
  setSubscriptionsData: () => {},
  piggyBanksData: [],
  setPiggyBanksData: () => {},
  obligatoriesData: [],
  setObligatoriesData: () => {}
});

const AuthContextProvider = (props: {children: React.ReactNode}) => {
  const [currentUserData, setCurrentUserData] = useState<CurrentUserData | {}>(JSON.parse(window.sessionStorage.getItem("Budgetify-user-data") || "{}"));
  const [accountsData, setAccountsData] = useState<AccountData[]>(JSON.parse(window.sessionStorage.getItem("Budgetify-user-accounts-data") || "{}") || []);
  const [transactionsData, setTransactionsData] = useState<TransactionData[]>(JSON.parse(window.sessionStorage.getItem("Budgetify-user-transactions-data") || "{}") || [])
  const [categoriesData, setCategoriesData] = useState<CategoryData[]>(JSON.parse(window.sessionStorage.getItem("Budgetify-user-categories-data") || "{}") || []);
  const [subscriptionsData, setSubscriptionsData] = useState<SubscriptionData[]>(JSON.parse(window.sessionStorage.getItem("Budgetify-user-subscriptions-data") || "{}") || []);
  const [piggyBanksData, setPiggyBanksData] = useState<PiggyBankData[]>(JSON.parse(window.sessionStorage.getItem("Budgetify-user-piggy-banks-data") || "{}") || []);
  const [obligatoriesData, setObligatoriesData] = useState<ObligatoryData[]>(JSON.parse(window.sessionStorage.getItem("Budgetify-user-obligatories-data") || "{}") || []);

  const makeSubscriptionPayment = async (subscription: SubscriptionData, account: AccountData, monthNumber: number, curYear: string, paymentDay: number) => {
    // transaction related
    try {
      const uid = uuid();
      const transactionBody = {
        id: uid,
        belongsToAccountWithId: account!._id,
        transactionType: "Expenses", 
        title: subscription.title, 
        description: subscription.description || "", 
        amount: subscription.amount, 
        date: `${curYear}-${monthNumber + 1}-${paymentDay}`, 
        chosenCategories: subscription.chosenCategories,
        payee: ""
      };
      const transaction = await createTransaction(transactionBody);

      // accounts related
      const accVal = removeThousandsCommas(account!.amount);
      const editTransVal = removeThousandsCommas(subscription.amount);
      const amountToSend = accVal - editTransVal;
      const accountBody = {infoForEdit: {
          accId: account!._id,
          fields: {amount: amountToSend.toString()}
      }};
      // send account update request.
      const acc= await editAccount(accountBody);

      // subscription related
      const subscriptionBody = {
        subscriptionId: subscription._id,
        belongsToAccountWithId: subscription.belongsToAccountWithId,
        fields: subscription.months.indexOf(11) === -1 ? 
          {
            months: [...subscription.months, monthNumber]
          }
        : 
          {
            year: subscription.year + 1,
            months: [monthNumber]
          }
      };
      const subscriptionRes = await editSubscription(subscriptionBody);

      // updates
      // update transactions data
      updateTransactionsData(transactionsData, setTransactionsData, {new: transaction, old: undefined}, "Insert");
      // update accounts data
      updateAccountsData(accountsData, setAccountsData, {new: acc, old: account}, "Update");
      // update subscriptions data
      updateSubscriptionsData(subscriptionsData, setSubscriptionsData, {new: subscriptionRes, old: subscription}, "Update");
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if(Object.keys(currentUserData).length) {
      const checkSubscriptionPayments = async () => {
        if(subscriptionsData && subscriptionsData.length) {
          const currentDate = new Date(await getGlobalTimeUnix()).toLocaleString().split(",")[0];
          const [curMonth, curDay, curYear] = currentDate.split("/");

          subscriptionsData.forEach((subscription: SubscriptionData) => {
            if(parseInt(curYear) === subscription.year) {
              // in db month is saved with one subtracted to it. (like array indexes, they sart from 0)
              const month = parseInt(curMonth) - 1;
              const paymentDay = parseInt(subscription.startDate.split("/")[1]);
              const account = accountsData.find((acc: AccountData) => subscription.belongsToAccountWithId === acc._id);

              if(subscription.months.indexOf(month) === -1 && account) {
                for(let monthNumber = subscription.months[subscription.months.length - 1]; monthNumber < month; monthNumber++) {
                  makeSubscriptionPayment(subscription, account, monthNumber, curYear, paymentDay);
                }

                if(parseInt(curDay) >= paymentDay) makeSubscriptionPayment(subscription, account, month, curYear, paymentDay);
              }
            }
          });
        }
      }

      checkSubscriptionPayments();
      // check in every hour
      const oneHour = 1000 * 60 * 60;
      const interval = setInterval(checkSubscriptionPayments, oneHour);

      return () => clearInterval(interval);
    }
  }, []);

  // This context provider provides with user related info.

  return (
    <AuthContext.Provider 
      value={{
        currentUserData,
        setCurrentUserData, 
        accountsData, 
        setAccountsData, 
        transactionsData, 
        setTransactionsData, 
        categoriesData, 
        setCategoriesData,
        subscriptionsData,
        setSubscriptionsData,
        piggyBanksData,
        setPiggyBanksData,
        obligatoriesData,
        setObligatoriesData
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export default AuthContextProvider;