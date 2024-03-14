import { useContext, useState } from "react";
import "./sideTransactionMenu.css";
import { HiXMark } from "react-icons/hi2";
import { MdOutlineModeEdit } from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";
import IndicatorButton from "../../IndicatorButton/IndicatorButton";
import AccountInfoField from "../../AccountInfoFIeld/AccountInfoFIeld";
import { FaImage } from "react-icons/fa";
import { GoArrowDown } from "react-icons/go";
import AddTransactionPrompt from "../../../../Containers/Home/AddTransactionPrompt/AddTransactionPrompt";
import { deleteTransactionApi, editAccountApi } from "../../../../apiURLs";
import ActionPrompt from "../../ActionPrompt/ActionPrompt";
import { getCategoryNameById, removeThousandsCommas, updateAccountsData, updateTransactionsData } from "../../../../Functions";
import { AuthContext } from "../../../../Contexts/AuthContextProvider";
import { GeneralContext } from "../../../../Contexts/GeneralContextProvider";

const SideTransactionMenu = (props: {
  setShowSideTransactionMenu: React.Dispatch<React.SetStateAction<{
    show: boolean;
    data: TransactionData | null;
  }>>,
  transactionInfo: TransactionData | null,
  accountData: AccountData,
  classname?: string
}) => {
  const iconSizes = {width: 25, height: 25};
  const info = props.transactionInfo;
  const acc = props.accountData as AccountData;
  const type = info && info.transactionType as "Income" | "Expenses" ;
  const currency = (props.accountData as AccountData).currency;

  const {transactionsData, setTransactionsData, accountsData, setAccountsData, categoriesData} = useContext(AuthContext);
  const {setShowToastMessage} = useContext(GeneralContext);

  const [showEditPrompt, setShowEditPrompt] = useState<boolean>(false);
  const [showDeletePrompt, setShowDeletePrompt] = useState<boolean>(false);

  const handleDelete = async () => {
    if(info) {
      // if we have transaction info present
      // body to send for transaction delete request
      const transactionBody = JSON.stringify({
        transactionId: info.id, 
        belongsToId: info.belongsToAccountWithId
      });

      // amount with which we update account
      const amountToSend = info.transactionType === "Income" ?
      removeThousandsCommas(acc.amount) - removeThousandsCommas(info.amount)
      : removeThousandsCommas(acc.amount) + removeThousandsCommas(info.amount);
      // account edit request body
      const accountBody = JSON.stringify({infoForEdit: {
        accId: acc._id,
        fields: {amount: amountToSend}
      }});

      try {
        // delete transaction request
        await fetch(deleteTransactionApi, {
          method: "POST",
          cache: "no-cache",
          mode: "cors",
          headers: {
            "Content-Type": "application/json"
          },
          body: transactionBody
        });

        // edit account request
        const accRes = await fetch(editAccountApi, {
          method: "PATCH",
          cache: "no-cache",
          mode: "cors",
          headers: {
            "Content-Type": "application/json"
          },
          body: accountBody
        });

        // this result will be updated account.
        const updatedAccount = await accRes.json();

        // update transactions data
        updateTransactionsData(transactionsData, setTransactionsData, {new: info, old: undefined}, "Delete");
        // update accounts data
        updateAccountsData(accountsData, setAccountsData, {new: updatedAccount, old: acc}, "Update");
        // show confirmation message
        setShowToastMessage({show: true, text: "Transaction was successfully removed"});
        // close delete confirmation prompt
        setShowDeletePrompt(false);
        // close transaction menu
        props.setShowSideTransactionMenu({data: null, show: false});
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
            <h3 className="fs-4">Transaction Information</h3>
            <div className="d-flex gap-2">
              <div onClick={() => setShowEditPrompt(true)} role="button">
                <MdOutlineModeEdit style={iconSizes} />
              </div>
              <div onClick={() => setShowDeletePrompt(true)} role="button">
                <FaRegTrashCan style={iconSizes} />
              </div>
              <div role="button" onClick={() => props.setShowSideTransactionMenu({show: false, data: null})}>
                <HiXMark style={iconSizes} />
              </div>
            </div>
          </div>
          {info && (
            <>
              <div className="mt-5 d-flex flex-column gap-4">
                <div className="d-flex align-items-center justify-content-between">
                  <IndicatorButton classname="bg-transparent" type={type!} />
                  <span style={{color: type === "Income" ? "var(--success)" : "var(--danger)"}} className="fs-3">{type === "Expenses" && "-"}{info.amount}{currency.split(" ")[1]}</span>
                </div>
                <h4 className="fs-4">{info.title}</h4>
                <div className="d-flex align-items-center flex-wrap gap-4">
                  {info.chosenCategories.map((category: string, key: number) => {
                    return <div style={{maxWidth: 160, border: "1px solid var(--border)"}} className="py-4 w-100 rounded d-flex justify-content-center align-items-center" key={key}>
                      <span className="fw-bold text-center text-break px-2">{getCategoryNameById(categoriesData, category) || category}</span>
                    </div>
                  })}
                </div>
              </div>
              <div className="mt-5 d-flex flex-column">
                <AccountInfoField title="Payment Date" text={info.date} hasLine />
                <AccountInfoField title="Payee" text={info.payee} hasLine />
                <AccountInfoField title="Description" text={info.description || ""} />
              </div>
              <div className="mt-5 d-flex flex-column flex-sm-row align-items-center gap-2 justify-content-between">
                <div className="d-flex align-items-center gap-4">
                  <FaImage style={{width: 60, height: 60}} />
                  <span className="fs-5">Receipt for {info.title}</span>
                </div>
                <div role="button" style={{backgroundColor: "var(--button)"}} className="p-2 rounded d-flex align-items-center gap-3">
                  <div style={{backgroundColor: "var(--component-background)", width: 35, height: 35}} className="rounded-circle d-flex align-items-center justify-content-center">
                    <GoArrowDown />
                  </div>
                  <span className="fs-5">Download</span>
                </div>
              </div>
              <hr className="my-1"/>
            </>
          )}
        </div>
      </div>
      <AddTransactionPrompt classname={`${showEditPrompt && "show"}`} transactionData={info ? info : undefined} accountData={props.accountData as AccountData} setShowAddTransactionPrompt={setShowEditPrompt} />
      {showDeletePrompt && 
        <ActionPrompt
          text="Are you sure you want to delete transaction?"
          head="Delete Transaction"
          cancel={{text: "No", action: () => setShowDeletePrompt(false)}}
          confirm={{text: "Yes", action: () => handleDelete()}}
        />
      }
    </>
  );
}

export default SideTransactionMenu;