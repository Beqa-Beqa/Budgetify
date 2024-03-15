import { createContext, useState, useEffect } from "react";
import { getGlobalTimeUnix, updateTransactionsData, removeThousandsCommas, updateAccountsData, updateSubscriptionsData } from "../Functions";
import { createTransactionApi, editAccountApi, editSubscriptionApi } from "../apiURLs";
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
  setSubscriptionsData: React.Dispatch<React.SetStateAction<SubscriptionData[]>>
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
  setSubscriptionsData: () => {}
});

const AuthContextProvider = (props: {children: React.ReactNode}) => {
  const [currentUserData, setCurrentUserData] = useState<CurrentUserData | {}>(JSON.parse(window.sessionStorage.getItem("Budgetify-user-data") || "{}"));
  const [accountsData, setAccountsData] = useState<AccountData[]>(JSON.parse(window.sessionStorage.getItem("Budgetify-user-accounts-data") || "{}") || []);
  const [transactionsData, setTransactionsData] = useState<TransactionData[]>(JSON.parse(window.sessionStorage.getItem("Budgetify-user-transactions-data") || "{}") || [])
  const [categoriesData, setCategoriesData] = useState<CategoryData[]>(JSON.parse(window.sessionStorage.getItem("Budgetify-user-categories-data") || "{}") || []);
  const [subscriptionsData, setSubscriptionsData] = useState<SubscriptionData[]>(JSON.parse(window.sessionStorage.getItem("Budgetify-user-subscriptions-data") || "{}") || []);


  const makeSubscriptionPayment = async (subscription: SubscriptionData, account: AccountData, monthNumber: number, curYear: string, paymentDay: number) => {
    // transaction related
    try {
      const uid = uuid();
      const transactionBody = JSON.stringify({
        id: uid,
        belongsToAccountWithId: account!._id,
        transactionType: "Expenses", 
        title: subscription.title, 
        description: subscription.description || "", 
        amount: subscription.amount, 
        date: `${curYear}-${monthNumber + 1}-${paymentDay}`, 
        chosenCategories: subscription.chosenCategories,
      });
      const transactionRes = await fetch(createTransactionApi, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json"
        },
        body: transactionBody
      });


      // accounts related
      const accVal = removeThousandsCommas(account!.amount);
      const editTransVal = removeThousandsCommas(subscription.amount);
      const amountToSend = accVal - editTransVal;
      const accountBody = JSON.stringify({infoForEdit: {
          accId: account!._id,
          fields: {amount: amountToSend.toString()}
      }});
      // send account update request.
      const accountResult = await fetch(editAccountApi, {
        method: "PATCH",
        mode: "cors",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json"
        },
        body: accountBody
      });


      // subscription related
      const subscriptionBody = JSON.stringify({
        subscriptionId: subscription._id,
        belongsToAccountWithId: subscription.belongsToAccountWithId,
        fields: {months: [...subscription.months, monthNumber]}
      });
      const subscriptionResult = await fetch(editSubscriptionApi, {
        method: "PATCH",
        mode: "cors",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json"
        },
        body: subscriptionBody
      });

      // updates
      // update transactions data
      const transaction = await transactionRes.json();
      updateTransactionsData(transactionsData, setTransactionsData, {new: transaction, old: undefined}, "Insert");
      // update accounts data
      const acc = await accountResult.json();
      updateAccountsData(accountsData, setAccountsData, {new: acc, old: account}, "Update");
      // update subscriptions data
      const subscriptionRes = await subscriptionResult.json();
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
        setSubscriptionsData
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export default AuthContextProvider;