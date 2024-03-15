import "./main.css";
import Card from "../../../Components/Home/Card/Card";
import MainSearch from "../../../Components/Home/MainSearch/MainSearch";
import { useContext, useState } from "react";
import IndicatorButton from "../../../Components/Home/IndicatorButton/IndicatorButton";
import { AuthContext } from "../../../Contexts/AuthContextProvider";
import AddAccountPrompt from "../AddAccountPrompt/AddAccountPrompt";
import AddTransactionPrompt from "../AddTransactionPrompt/AddTransactionPrompt";
import SideTransactionMenu from "../../../Components/Home/SideMenus/Transaction/SideTransactionMenu";
import Transaction from "../../../Components/Home/Transaction/Transaction";
import { GeneralContext } from "../../../Contexts/GeneralContextProvider";
import AddCategoryPrompt from "../AddCategoryPrompt/AddCategoryPrompt";
import Category from "../../../Components/Home/Category/Category";
import { sortArrOfObjectByKey } from "../../../Functions";
import AddSubscriptionPrompt from "../AddSubscriptionPrompt/AddSubscriptionPrompt";
import Subscription from "../../../Components/Home/Subscription/Subscription";
import SideSubscriptionMenu from "../../../Components/Home/SideMenus/Subscription/SideSubscriptionMenu";

const Main = () => {
  // navigation
  const {navigateTo, showAddCategoryPrompt, setShowAddCategoryPrompt} = useContext(GeneralContext);
  // list of accounts data.
  const {accountsData, transactionsData, categoriesData, subscriptionsData} = useContext(AuthContext);
  // sort setting holder state.
  const [sortByPamentDate, setSortByPaymentDate] = useState<"desc" | "asc">("desc");
  const [sortByTransaction, setSortByTransaction] = useState<"Income" | "Expenses" | "">("");
  // search bar state
  const [searchValue, setSearchValue] = useState<string>("");
  // active card holder state.
  const [activeCard, setActiveCard] = useState<number>(NaN);
  // if accounts exist and active card is NaN, update it to 0.
  accountsData.length && !(activeCard >= 0) && setActiveCard(0);
  // if accounts data does not exist and active card is >= 0 (by index) update it to NaN.
  !accountsData.length && activeCard >= 0 && setActiveCard(NaN);
  // if card is removed update active card index by -1.
  activeCard > accountsData.length - 1 && setActiveCard(prev => prev - 1);
  // State for to show add account prompt or not.
  const [showAddAccountPrompt, setShowAddAccountPrompt] = useState<boolean>(false);
  // transaction show holder state.
  const [showAddTransactionPrompt, setShowAddTransactionPrompt] = useState<boolean>(false);
  // transaction side info menu.
  const [showTransactionInfo, setShowTransactionInfo] = useState<{show: boolean, data: TransactionData | null}>({show: false, data: null});
  // subscription add prompt holder state
  const [showAddSubscriptionPrompt, setShowAddSubscriptionPrompt] = useState<boolean>(false);
  // subscription side info meni
  const [showSubscriptionInfo, setShowSubscriptionInfo] = useState<{show: boolean, data: SubscriptionData | null}>({show: false, data: null});

  const filteredTransactionsByCard = transactionsData.filter((transaction: TransactionData) => accountsData[activeCard] && transaction.belongsToAccountWithId === accountsData[activeCard]._id)
                                                     .filter((transaction: TransactionData) => sortByTransaction === "Income" ? transaction.transactionType === "Income" : sortByTransaction === "Expenses" ? transaction.transactionType === "Expenses" : transaction)
                                                     .filter((transaction: TransactionData) => searchValue.length >= 2 ? transaction.title.toLowerCase().includes(searchValue.toLowerCase().trim()) : transaction)
                                                     .sort((a: TransactionData, b: TransactionData) => sortByPamentDate === "desc" ? new Date(b.date).getTime() - new Date(a.date).getTime() : new Date(a.date).getTime() - new Date(b.date).getTime());

  const filteredCategories = categoriesData.filter((category: CategoryData) => sortByTransaction === "Expenses" ? category.transactionType === "Expenses" : sortByTransaction === "Income" ? category.transactionType === "Income" : category)
                                           .filter((category: CategoryData) => searchValue.length >= 2 ? category.title.toLowerCase().includes(searchValue.toLowerCase().trim()) : category);

  const filteredSubscriptionsByCard = subscriptionsData.filter((subscription: SubscriptionData) => accountsData[activeCard] && subscription.belongsToAccountWithId === accountsData[activeCard]._id)
                                                       .filter((subscription: SubscriptionData) => searchValue.length >= 2 ? subscription.title.toLowerCase().includes(searchValue.toLowerCase().trim()) : subscription)
                                                       .sort((a: SubscriptionData, b: SubscriptionData) => sortByPamentDate === "desc" ? parseInt(b.creationDate) - parseInt(a.creationDate) : parseInt(a.creationDate) - parseInt(b.creationDate));
  
  return (
    <>
      <div className="homepage-main container-fluid">
        <div className="row row-wrap justify-content-between">
          <div style={{height: "fit-content !important"}} className="position-relative col-xl-4 col-12 d-flex flex-column gap-2">
            {accountsData.length ? <div className="cards-container d-flex flex-row flex-xl-column justify-content-xl-start gap-2 pb-4 mt-4 mt-xl-0 pb-xl-0 pe-xl-3">
              {accountsData.map((account: AccountData, key: number) => {
                const isActive = key === activeCard;
                const handleClick = () => setActiveCard(key);

                return <Card accountData={account} onclick={handleClick} active={isActive} classname="col-xxl col-xl-12 col-md-6 col-12" key={key}  />
              })}
            </div> : null}
            <div className="w-100 pe-xl-3">
              <Card onclick={() => setShowAddAccountPrompt(true)} classname="active align-self-md-center col-xxl col-xl-12 col-md-6 col mb-4 mb-xl-0" />
            </div>
          </div>
          <div className="h-100 col-xxl-5 col-xl-6 col-lg-9 p-xl-0 pe-2 mb-3 mb-lg-0">
            <MainSearch searchValue={searchValue} setSearchValue={setSearchValue} sortByTransaction={sortByTransaction} setSortByTransaction={setSortByTransaction} sortByPaymentDate={sortByPamentDate} setSortByPaymentDate={setSortByPaymentDate}/>
            <div className="main-content-container mt-1">
              {navigateTo === "Categories" ?
                categoriesData.length ?
                  filteredCategories.length ?
                    <div className="d-flex flex-wrap justify-content-start gap-2">
                      {sortArrOfObjectByKey("title", filteredCategories).map((category: CategoryData) => {
                        return <Category key={category._id} categoryData={category} />
                      })}
                    </div>
                  :
                    <div className="w-100 text-center my-3 overflow-hidden">
                      <h2 style={{color: "var(--placeholder)"}} className="fs-2 opacity-25">No records to display</h2>
                    </div>
                : 
                  <div className="w-100 text-center my-3 overflow-hidden">
                    <h2 style={{color: "var(--placeholder)"}} className="fs-2 opacity-25">You don't have any categories. Please, add a category</h2>
                  </div>
              : navigateTo === "Subscriptions" ?
                  subscriptionsData.length ?
                    filteredSubscriptionsByCard.length ?
                      <div className="d-flex flex-column gap-4">
                        {filteredSubscriptionsByCard.map((subscription: SubscriptionData, key: number) => {
                          const currency = accountsData[activeCard].currency;

                          return <Subscription key={key} subscription={subscription} currency={currency} onclick={() => setShowSubscriptionInfo({show: true, data: subscription})} />
                        })}
                      </div>
                    :
                      <div className="w-100 text-center my-3 overflow-hidden">
                        <h2 style={{color: "var(--placeholder)"}} className="fs-2 opacity-25">No records to display</h2>
                      </div>
                  :
                    <div className="w-100 text-center my-3 overflow-hidden">
                      <h2 style={{color: "var(--placeholder)"}} className="fs-2 opacity-25">You don't have any subscriptions. Please, add a subscription</h2>
                    </div>
              :
                transactionsData.length ?
                  filteredTransactionsByCard.length ?
                    <div className="d-flex flex-column gap-4">
                      {filteredTransactionsByCard.map((transaction: TransactionData, key: number) => {
                        const currency = accountsData[activeCard].currency;

                        return <Transaction key={key} transaction={transaction} currency={currency} onclick={() => {setShowTransactionInfo({show: true, data: transaction})}} />
                        })}
                    </div>
                  :
                    <div className="w-100 text-center my-3 overflow-hidden">
                      <h2 style={{color: "var(--placeholder)"}} className="fs-2 opacity-25">No records to display</h2>
                    </div>
                :
                  <div className="w-100 text-center my-3 overflow-hidden">
                    <h2 style={{color: "var(--placeholder)"}} className="fs-2 opacity-25">You don't have any transactions. Please, add a transaction.</h2>
                  </div>
              }
            </div>
          </div>
          <div className="col-xl-2 col-lg-3">
            <div className="d-flex flex-column align-items-end gap-3">
              <IndicatorButton classname="p-2 fs-5 w-100" type="Income" />
              <IndicatorButton classname="p-2 fs-5 w-100" type="Expenses"/>
              {activeCard >= 0 && navigateTo === "none" ? <IndicatorButton classname="p-2 fs-5 w-100" onclick={() => setShowAddTransactionPrompt(true)} type="Add Transaction"/> : null}
              {navigateTo === "Categories" && <IndicatorButton onclick={() => setShowAddCategoryPrompt(true)} classname="p-2 fs-5 w-100" type="Add Category" />}
              {navigateTo === "Subscriptions" && <IndicatorButton onclick={() => setShowAddSubscriptionPrompt(true)} classname="p-2 fs-5 w-100" type="Add Subscription" />}
            </div>
          </div>
        </div>
      </div>
      <AddAccountPrompt classname={showAddAccountPrompt ? "show" : ""} setShowAddAccountPrompt={setShowAddAccountPrompt} />
      {!isNaN(activeCard) && 
        <>
          <AddTransactionPrompt classname={`${showAddTransactionPrompt ? "show" : ""}`} accountData={accountsData[activeCard]} setShowAddTransactionPrompt={setShowAddTransactionPrompt} />
          <SideTransactionMenu accountData={accountsData[activeCard]} transactionInfo={showTransactionInfo.data && showTransactionInfo.data} setShowSideTransactionMenu={setShowTransactionInfo} classname={`${showTransactionInfo.show && "show"}`} />
          <AddSubscriptionPrompt accountData={accountsData[activeCard]} classname={showAddSubscriptionPrompt ? "show" : ""} setShowAddSubscriptionPrompt={setShowAddSubscriptionPrompt} />
          <SideSubscriptionMenu accountData={accountsData[activeCard]} subscriptionInfo={showSubscriptionInfo.data} setShowSideSubscriptionMenu={setShowSubscriptionInfo} classname={showSubscriptionInfo.show ? "show" : ""} />
        </>
      }
      <AddCategoryPrompt classname={showAddCategoryPrompt ? "show" : ""} setShowAddCategoryPrompt={setShowAddCategoryPrompt} />
    </>
  );
}

export default Main;