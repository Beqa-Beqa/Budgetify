import "./main.css";
import Card from "../../../Components/Home/Card/Card";
import MainSearch from "../../../Components/Home/MainSearch/MainSearch";
import { useContext, useState } from "react";
import IndicatorButton from "../../../Components/Home/IndicatorButton/IndicatorButton";
import { AuthContext } from "../../../Contexts/AuthContextProvider";
import AddAccountPrompt from "../AddAccountPrompt/AddAccountPrompt";
import AddTransactionPrompt from "../AddTransactionPrompt/AddTransactionPrompt";
import { GoDotFill } from "react-icons/go";
import SideTransactionMenu from "../../../Components/Home/SideMenus/Transaction/SideTransactionMenu";

const Main = () => {
  // list of accounts data.
  const {accountsData, transactionsData} = useContext(AuthContext);
  // sort setting holder state.
  const [sortByPamentDate, setSortByPaymentDate] = useState<"desc" | "asc">("desc");
  const [sortByTransaction, setSortByTransaction] = useState<"Income" | "Expenses" | "">("");
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

  const filteredTransactionsByCard = transactionsData.filter((transaction: TransactionData) => accountsData[activeCard] && transaction.belongsToAccountWithId === accountsData[activeCard]._id)
                                                     .filter((transaction: TransactionData) => sortByTransaction === "Income" ? transaction.transactionType === "Income" : sortByTransaction === "Expenses" ? transaction.transactionType === "Expenses" : transaction);

  return (
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
          <MainSearch sortByTransaction={sortByTransaction} setSortByTransaction={setSortByTransaction} sortByPaymentDate={sortByPamentDate} setSortByPaymentDate={setSortByPaymentDate}/>
          <div className="transactions-container d-flex flex-column mt-1 gap-4">
            {filteredTransactionsByCard.length ? filteredTransactionsByCard                      
            .sort((a: TransactionData, b: TransactionData) => sortByPamentDate === "desc" ? new Date(b.date).getTime() - new Date(a.date).getTime() : new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((transaction: TransactionData, key: number) => {
              const type = transaction.transactionType as "Income" | "Expenses";

              return (
                <div onClick={() => setShowTransactionInfo({show: true, data: transaction})} className="transaction w-100 p-3 rounded d-flex align-items-center gap-3" key={key}>
                  <div className="rounded transaction-title w-100 py-4 d-flex justify-content-center">
                    <span className="fw-bold fs-5">{transaction.chosenCategories[0]}</span>
                  </div>
                  <div className="w-100 h-100 d-flex flex-column gap-3">
                    <div className="d-flex justify-content-between">
                      <span className="fs-5">{transaction.title}</span>
                      <span style={{color: type === "Income" ? "var(--success)" : "var(--danger)"}} className="fs-4">{type === "Expenses" ? "-" : ""}{transaction.amount}{accountsData[activeCard].currency.split(" ")[1]}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <IndicatorButton classname="h-50 mb-1" type={type} />
                      <GoDotFill style={{width: 5, height: 5}} />
                      <span>{transaction.date.split("-").reverse().join(".")}</span>
                      {transaction.payee && <>
                        <GoDotFill style={{width: 5, height: 5}} />
                        <span>{transaction.payee}</span>
                      </>}
                    </div>
                  </div>
                </div>
              );
            })
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
            {activeCard >= 0 ? <IndicatorButton classname="p-2 fs-5 w-100" onclick={() => setShowAddTransactionPrompt(true)} type="Add Transaction"/> : null}
          </div>
        </div>
      </div>
      <AddAccountPrompt classname={showAddAccountPrompt ? "show" : ""} setShowAddAccountPrompt={setShowAddAccountPrompt} />
      <AddTransactionPrompt classname={`${showAddTransactionPrompt ? "show" : ""}`} accountData={accountsData[activeCard]} setShowAddTransactionPrompt={setShowAddTransactionPrompt} />
      <SideTransactionMenu accountData={!isNaN(activeCard) && accountsData[activeCard]} transactionInfo={showTransactionInfo.data && showTransactionInfo.data} setShowSideTransactionMenu={setShowTransactionInfo} classname={`${showTransactionInfo.show && "show"}`} />
    </div>
  );
}

export default Main;