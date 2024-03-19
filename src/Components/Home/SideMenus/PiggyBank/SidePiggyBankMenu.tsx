import { useContext, useState } from "react";
import "./sidePiggyBankMenu.css";
import "../../PiggyBank/piggyBank.css";
import { MdOutlineModeEdit } from "react-icons/md";
import ActionPrompt from "../../ActionPrompt/ActionPrompt";
import { HiXMark } from "react-icons/hi2";
import AddPiggyBankPrompt from "../../../../Containers/Home/AddPiggyBankPrompt/AddPiggyBankPrompt";
import { AuthContext } from "../../../../Contexts/AuthContextProvider";
import AccountInfoField from "../../AccountInfoFIeld/AccountInfoFIeld";
import { PiggyIcon } from "../../../../Assets/Home";
import AddPiggyAmount from "../../../../Containers/Home/AddPiggyBankPrompt/AddPiggyAmount";
import { createCategory, createTransaction, deletePiggyBank, divideByThousands, editAccount, removeThousandsCommas, updateAccountsData, updateCategoriesData, updatePiggyBanksData, updateTransactionsData } from "../../../../Functions";
import { createCategoryApi, createTransactionApi, deletePiggyBankApi, editAccountApi } from "../../../../apiURLs";
import {v4 as uuid} from "uuid";
import { GeneralContext } from "../../../../Contexts/GeneralContextProvider";

const SidePiggyBankMenu = (props: {
  piggyBankInfo: PiggyBankData | null,
  setShowPiggyBankMenu: React.Dispatch<React.SetStateAction<{
    show: boolean;
    data: PiggyBankData | null;
  }>>,
  classname?: string
}) => {
  // info of piggybank.
  const info = props.piggyBankInfo;
  // piggy bank progress bar width.
  const piggyProgressWidth = info ? 
    info.currentAmount !== "0.00" ?
    (removeThousandsCommas(info.currentAmount) / removeThousandsCommas(info.goalAmount) * 100).toFixed() + "%" : 0
  :
    0;

  // context information about user.
  const {accountsData, currentUserData, categoriesData, setCategoriesData, transactionsData, setTransactionsData, setAccountsData, piggyBanksData, setPiggyBanksData} = useContext(AuthContext);
  const {setShowToastMessage} = useContext(GeneralContext);

  // account to which belongs the piggy bank
  const accInfo = info && accountsData.find(acc => acc._id === info.belongsToAccountWithId) as AccountData;
  // currency
  const currency = accInfo?.currency.split(" ")[1];
  // icon sizes.
  const iconSizes = {width: 25, height: 25};

  // prompt states
  const [showEditPrompt, setShowEditPrompt] = useState<boolean>(false);
  const [showCrashPrompt, setShowCrashPrompt] = useState<boolean>(false);
  const [showAddAmountPrompt, setShowAddAmountPrompt] = useState<boolean>(false);

  // handle crash
  const handleCrash = async () => {
    if(info) {
      // if info is present.
      try {
        // new account amount (piggy bank collected amount is added to the current account amount).
        const newAccAmount = divideByThousands(removeThousandsCommas(accInfo!.amount) + removeThousandsCommas(info.currentAmount));

        // delete piggy bank
        await deletePiggyBank({belongsToAccountWithId: info.belongsToAccountWithId, piggyBankId: info._id});

        // if collected money of piggy bank is not 0, create category and edit account.
        if(info.currentAmount !== "0.00") {
          // category create request.
          const createdCategory: CategoryData = await createCategory({
            owner: (currentUserData as CurrentUserData)._id,
            transactionType: "Income",
            title: info.goal
          });
          
          // account edit request.
          const editedAccount: AccountData = await editAccount({
            infoForEdit: {
              accId: accInfo!._id,
              fields: {amount: newAccAmount}
            }
          });
  
          // transaction create request.
          // const transactionRes = await createTransaction({
          //   id: uuid(),
          //   belongsToAccountWithId: accInfo!._id,
          //   transactionType: "Income",
          //   title: info.goal,
          //   description: "",
          //   amount: info.currentAmount,
          //   date: JSON.parse(window.sessionStorage.getItem("budgetify-current-date")!) || new Date().toString().split(",")[0],
          //   chosenCategories: [createdCategory._id],
          //   payee: "",
          // });
  
          // created transaction
          // const transaction = await transactionRes.json();
  
          // update all the data in cache and states.
          updateCategoriesData(categoriesData, setCategoriesData, {new: createdCategory, old: undefined}, "Insert");
          // updateTransactionsData(transactionsData, setTransactionsData, {new: transaction, old: undefined}, "Insert");
          updateAccountsData(accountsData, setAccountsData, {new: editedAccount, old: accInfo!}, "Update");
        }

        // update piggy banks data.
        updatePiggyBanksData(piggyBanksData, setPiggyBanksData, {new: info, old: undefined}, "Delete");

        // set toast message
        setShowToastMessage({show: true, text: "Piggy bank crashed successfully"});
        // close prompts.
        setShowCrashPrompt(false);
        props.setShowPiggyBankMenu({show: false, data: null});
      } catch (err) {
        console.error(err);
      }
    }
  }

  return (
    <>
      <div className={`${props.classname === "show" ? "prompt" : ""}`}>
        <div style={{overflowY: "auto"}} className={`prompt-box ${props.classname} w-100 h-100 p-2 p-sm-3 p-lg-4`}>
          <div className="w-100 d-flex justify-content-between align-items-center gap-2">
            <h3 className="fs-4">Piggy Bank Information</h3>
            <div className="d-flex gap-2">
              <div onClick={() => setShowEditPrompt(true)} role="button">
                <MdOutlineModeEdit style={iconSizes} />
              </div>
              <div onClick={() => {}} role="button">
                <div
                  onClick={() => setShowAddAmountPrompt(true)}
                  style={{...iconSizes, border: "1px solid var(--dark-piggy)", color: "var(--dark-piggy)"}} 
                  className="fs-3 d-flex align-items-center justify-content-center rounded-circle">+</div>
              </div>
              <div role="button" onClick={() => props.setShowPiggyBankMenu({show: false, data: null})}>
                <HiXMark style={iconSizes} />
              </div>
            </div>
          </div>
          {info &&
            <>
              <div className="mt-5 d-flex flex-column w-100 gap-2">
                <span className="">{info.currentAmount} / {info.goalAmount} {currency}</span>
                <div style={{backgroundColor: "var(--piggy)"}} className="w-100 rounded-5">
                  <div style={{width: piggyProgressWidth}} className="p-1 piggy-progress-bar-progress rounded-5" />
                </div>
              </div>
              <div className="mt-5 d-flex flex-column">
                <AccountInfoField classname="text-break" title="Goal" text={info.goal} hasLine />
                <AccountInfoField title="Goal Amount" text={`${info.goalAmount} ${currency}`} hasLine />
                <AccountInfoField title="Saved Amount" text={`${info.currentAmount} ${currency}`} />
              </div>
            </>
          }
          <div onClick={() => setShowCrashPrompt(true)} role="button" style={{backgroundColor: "var(--piggy)", width: "fit-content"}} className="d-flex p-2 pe-3 gap-2 rounded-2 align-items-center mt-4">
            <div style={{backgroundColor: "var(--component-background)", width: 35, height: 35}} className="rounded-circle d-flex justify-content-center align-items-center">
              <img src={PiggyIcon} alt="piggy icon"/>
            </div>
            <span className="fs-5 fw-bold">Crash</span>
          </div>
        </div>
      </div>
      {info && accInfo && <AddPiggyBankPrompt classname={`${showEditPrompt && "show"}`} piggyBankInfo={info} setShowAddPiggyBankPrompt={setShowEditPrompt} accountData={accInfo} />}
      {info && accInfo && <AddPiggyAmount currency={currency!} piggyBankInfo={info} setShowAddAmountPrompt={setShowAddAmountPrompt} classname={showAddAmountPrompt ? "show" : ""} />}
      {showCrashPrompt && 
        <ActionPrompt
          text={`Are you sure you want to crash the Piggy Bank '${info?.goal}'?[br]Money will go to your account.`}
          head="Crash piggy bank"
          cancel={{text: "No", action: () => setShowCrashPrompt(false)}}
          confirm={{text: "Yes", action: () => handleCrash()}}
        />
      }
    </>
  );
}

export default SidePiggyBankMenu;