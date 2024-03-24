import { createContext, useState, useEffect } from "react";
import { getGlobalTimeUnix, updateTransactionsData, removeThousandsCommas, updateAccountsData, updateSubscriptionsData, editAccount, editSubscription, createTransaction, deleteSubscription, deleteObligatory, updateObligatoriesData, editObligatory } from "../Functions";
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

  const makeDuePayment = async (payment: {subscription?: SubscriptionData, obligatory?: ObligatoryData}, account: AccountData, monthNumber: number, curYear: string, paymentDay: number) => {
    // transaction related
    const {subscription, obligatory} = payment;

    try {
      // initialize variables
      let transaction: TransactionData | undefined = undefined;
      let subscriptionRes: SubscriptionData | undefined = undefined;
      let obligatoryRes: ObligatoryData | undefined = undefined;

      // unique id for transaction
      const uid = uuid();

      if(subscription) {
        // if we have subscription, create transaction on behalf of it
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

        // subscription edit body
        // if subscription's paid months include last month (december - 11)
        // then increment year and set months array only with current month
        // otherwise just add current month to current months (same goes for obligatory)
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

        subscriptionRes = await editSubscription(subscriptionBody);
        transaction = await createTransaction(transactionBody);
      } else if (obligatory) {
        // if it's obligatory payment, make transaction on behalf of it.
        const transactionBody = {
          id: uid,
          belongsToAccountWithId: account!._id,
          transactionType: "Expenses", 
          title: obligatory.title, 
          description: obligatory.description || "", 
          amount: obligatory.amount || "0.00", 
          date: `${curYear}-${monthNumber + 1}-${paymentDay}`, 
          chosenCategories: ["Obligatory"],
          payee: ""
        };

        const obligatoryBody = {
          belongsToAccountWithId: obligatory.belongsToAccountWithId,
          obligatoryId: obligatory._id,
          fields: obligatory.months.indexOf(11) === -1 ?
            {
              months: [...obligatory.months, monthNumber]
            }
          :
            {
              year: obligatory.year + 1,
              months: [monthNumber]
            }
        }

        obligatoryRes = await editObligatory(obligatoryBody);
        transaction = await createTransaction(transactionBody);
      } else {
        // if none are given throw the error.
        throw new Error("No subscription or obligatory was given in makeDuePayment function! (AuthContextProvider)");
      }

      // accounts related
      const accVal = removeThousandsCommas(account!.amount);
      const editTransVal = removeThousandsCommas((subscription?.amount || obligatory?.amount)!);
      const amountToSend = accVal - editTransVal;
      const accountBody = {infoForEdit: {
          accId: account!._id,
          fields: {amount: amountToSend.toString()}
      }};
      // send account update request.
      const acc = await editAccount(accountBody);

      // updates
      // update transactions data
      transaction && updateTransactionsData(transactionsData, setTransactionsData, {new: transaction, old: undefined}, "Insert");
      // update accounts data
      updateAccountsData(accountsData, setAccountsData, {new: acc, old: account}, "Update");
      // update subscriptions data
      subscriptionRes && updateSubscriptionsData(subscriptionsData, setSubscriptionsData, {new: subscriptionRes, old: subscription}, "Update");
      // update obligatories data
      obligatoryRes && updateObligatoriesData(obligatoriesData, setObligatoriesData, {new: obligatoryRes, old: obligatory}, "Update");
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if(Object.keys(currentUserData).length) {
      const checkDuePayments = async () => {
        const currentDate = new Date(await getGlobalTimeUnix()).toLocaleString().split(",")[0];
        const [curMonth, curDay, curYear] = currentDate.split("/");

        // subscription payments
        if(subscriptionsData && subscriptionsData.length) {
          subscriptionsData.forEach(async (subscription: SubscriptionData) => {
            // in db month is saved with one subtracted to it. (like array indexes, they sart from 0)
            const month = parseInt(curMonth) - 1;
            const paymentDay = parseInt(subscription.startDate.split("/")[1]);
            const account = accountsData.find((acc: AccountData) => subscription.belongsToAccountWithId === acc._id);

            const [endMonth, endDay, endYear] = subscription.endDate.split("/");

            // if current year is equal to subscription end year and end month is included in paid months
            // delete subscription and update subscription data.
            // otherwise pay and update months.
            if(parseInt(curYear) === parseInt(endYear) && subscription.months.indexOf(parseInt(endMonth) - 1) !== -1) {
              await deleteSubscription({belongsToAccountWithId: subscription.belongsToAccountWithId, subscriptionId: subscription._id});
              updateSubscriptionsData(subscriptionsData, setSubscriptionsData, {new: subscription, old: undefined}, "Delete");
            } else {
              if(subscription.months.indexOf(month) === -1) {
                for(let monthNumber = subscription.months[subscription.months.length - 1]; monthNumber < month; monthNumber++) {
                  makeDuePayment({subscription}, account!, monthNumber, curYear, paymentDay);
                }
                if(parseInt(curDay) >= paymentDay || (parseInt(curYear) === parseInt(endYear) && parseInt(curMonth) === parseInt(endMonth) && parseInt(endDay) < paymentDay && parseInt(curDay) >= parseInt(endDay))) {
                  makeDuePayment({subscription}, account!, month, curYear, paymentDay);
                } 
              }
            }
          });
        }

        // obligatory payments
        if(obligatoriesData && obligatoriesData.length) {
          obligatoriesData.forEach(async (obligatory: ObligatoryData) => {
            if(obligatory.amount !== "0.00") {
              // in db month is saved with one subtracted to it. (like array indexes, they sart from 0)
              const month = parseInt(curMonth) - 1;
              const paymentDay = parseInt(obligatory.startDate.split("/")[1]);
              const account = accountsData.find((acc: AccountData) => obligatory.belongsToAccountWithId === acc._id);

              const [endMonth, endDay, endYear] = obligatory.endDate.split("/");

              if(parseInt(curYear) === parseInt(endYear) && obligatory.months.indexOf(parseInt(endMonth) - 1) !== -1) {
                await deleteObligatory({belongsToAccountWithId: obligatory.belongsToAccountWithId, obligatoryId: obligatory._id});
                updateObligatoriesData(obligatoriesData, setObligatoriesData, {new: obligatory, old: undefined}, "Delete");
              } else {
                if(obligatory.months.indexOf(month) === -1) {
                  for(let monthNumber = obligatory.months[obligatory.months.length - 1]; monthNumber < month; monthNumber++) {
                    makeDuePayment({obligatory}, account!, monthNumber, curYear, paymentDay);
                  }
                  if(parseInt(curDay) >= paymentDay || (parseInt(curYear) === parseInt(endYear) && parseInt(curMonth) === parseInt(endMonth) && parseInt(endDay) < paymentDay && parseInt(curDay) >= parseInt(endDay))) {
                    makeDuePayment({obligatory}, account!, month, curYear, paymentDay);
                  } 
                }
              }
            }
          });
        }
      }

      checkDuePayments();
      // check in every hour
      const oneHour = 1000 * 60 * 60;
      const interval = setInterval(checkDuePayments, oneHour);

      return () => clearInterval(interval);
    }
  }, [subscriptionsData, obligatoriesData]);

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