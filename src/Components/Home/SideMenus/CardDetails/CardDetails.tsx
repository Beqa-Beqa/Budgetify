import { HiXMark } from "react-icons/hi2";
import "./cardDetails.css";
import { MdOutlineModeEdit } from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";
import AccountInfoField from "../../AccountInfoFIeld/AccountInfoFIeld";
import { useContext, useState } from "react";
import { AuthContext } from "../../../../Contexts/AuthContextProvider";
import AddAccountPrompt from "../../../../Containers/Home/AddAccountPrompt/AddAccountPrompt";
import { deleteAccount, deleteObligatory, deleteSubscription, deleteTransaction, divideByThousands, makeFirstCapitals, removeThousandsCommas, updateAccountsData } from "../../../../Functions";
import ActionPrompt from "../../ActionPrompt/ActionPrompt";
import { GeneralContext } from "../../../../Contexts/GeneralContextProvider";

const CardDetails = (props: {
  setShowDetails: React.Dispatch<React.SetStateAction<boolean>>,
  accountData: AccountData,
  classname?: string
}) => {
  // authcontext provides with user data and accountsdata. also accounts data setter.
  const authContext = useContext(AuthContext);
  const currentUserData = authContext.currentUserData as CurrentUserData;
  const {accountsData, setAccountsData, transactionsData, setTransactionsData, subscriptionsData, setSubscriptionsData, obligatoriesData, setObligatoriesData} = authContext;

  // general context provides with toast message setter.
  const {setShowToastMessage} = useContext(GeneralContext);

  // split currency (ex: "USD $" => ["USD", "$"])
  const splitCurrency = props.accountData.currency.split(" ");

  // state for showing add account prompt (or edit).
  const [showAddAccountPrompt, setShowAddAccountPrompt] = useState<boolean>(false);
  // action prompt (for deleting).
  const [showActionPrompt, setShowActionPrompt] = useState<boolean>(false);

  const handleAccountDelete = async () => {
    // server excepts body for deleting in format:
    // {accId: (account id), userId: (account owner id)}
    try {
      // make request
      const deleteData = async (accountId: string) => {
        // transactions
        for(let transaction of transactionsData) {
          await deleteTransaction({belongsToId: accountId, transactionId: transaction.id});
        }
        const updatedTransactionsData = transactionsData.filter(transaction => transaction.belongsToAccountWithId !== props.accountData._id);
        setTransactionsData(updatedTransactionsData);

        // subscriptions
        for(let subscription of subscriptionsData) {
          await deleteSubscription({belongsToAccountWithId: accountId, subscriptionId: subscription._id});
        }
        const updatedSubscriptionsData = subscriptionsData.filter(subscription => subscription.belongsToAccountWithId !== props.accountData._id);
        setSubscriptionsData(updatedSubscriptionsData);

        // obligatories
        for(let obligatory of obligatoriesData) {
          await deleteObligatory({belongsToAccountWithId: accountId, obligatoryId: obligatory._id});
        }
        const updatedObligatoriesData = obligatoriesData.filter(obligatory => obligatory.belongsToAccountWithId !== props.accountData._id);
        setObligatoriesData(updatedObligatoriesData);
      }

      deleteData(props.accountData._id);
      await deleteAccount({accId: props.accountData._id,userId: currentUserData._id});

      // Remove account
      updateAccountsData(accountsData, setAccountsData, {new: props.accountData, old: undefined}, "Delete");
      // close acc info.
      props.setShowDetails(false);
      // set toast message.
      setShowToastMessage({show: true, text: "Account is successfully deleted"});
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      {!showAddAccountPrompt && !showActionPrompt &&<div className={`${props.classname === "show" ? "prompt" : ""}`}>
        <div className={`prompt-box ${props.classname} d-flex flex-column gap-5 w-100 p-4`}>
          <div className="w-100 position-relative d-flex align-items-center justify-content-center">
            <div className="d-flex align-items-center justify-content-between w-100">
              <h3 className="fs-4">Account Information</h3>
              <div className="d-flex align-items-center gap-1">
                <div onClick={() => setShowAddAccountPrompt(true)} className="icon p-1" role="button">
                  <MdOutlineModeEdit />
                </div>
                <div onClick={() => setShowActionPrompt(true)} className="icon p-1" role="button">
                  <FaRegTrashCan />
                </div>
                <div role="button" onClick={() => props.setShowDetails(false)}>
                  <HiXMark style={{width: 30, height: 30}} />
                </div>
              </div>
            </div>
          </div>
          <div>
            <AccountInfoField hasLine title="Title" text={makeFirstCapitals(props.accountData.title)} />
            <AccountInfoField hasLine title="Amount" text={divideByThousands(removeThousandsCommas(props.accountData.amount))} />
            <AccountInfoField hasLine title="Currency" text={`${splitCurrency[0]} (${splitCurrency[1]})`} />
            <AccountInfoField title="Description" text={props.accountData.description} />
          </div>
          <div className="d-flex mt-auto justify-content-end">
            <button onClick={() => props.setShowDetails(false)} style={{color: "var(--text)"}} className="action-button negative">Close</button>
          </div>
        </div>
      </div>}
      <AddAccountPrompt classname={showAddAccountPrompt ? "show" : ""} data={props.accountData} setShowAddAccountPrompt={setShowAddAccountPrompt} />
      {showActionPrompt && 
        <ActionPrompt
          head="Delete Account"
          text="Are you sure you want to delete this account?" 
          confirm={{action: handleAccountDelete, text: "Yes"}}
          cancel={{action: () => setShowActionPrompt(false), text: "No"}}
        />}
    </>
  );
}

export default CardDetails;