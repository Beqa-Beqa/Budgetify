import { HiXMark } from "react-icons/hi2";
import "../../CSS/Components/cardDetails.css";
import { MdOutlineModeEdit } from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";
import AccountInfoField from "./AccountInfoFIeld";
import { useContext, useState } from "react";
import { AuthContext } from "../../Contexts/AuthContextProvider";
import AddAccountPrompt from "../../Containers/Home/AddAccountPrompt";
import { makeFirstCapitals } from "../../Functions";

const CardDetails = (props: {
  setShowDetails: React.Dispatch<React.SetStateAction<boolean>>,
  accountData: AccountData
}) => {
  const deleteAccountApi = "https://budgetify-back.adaptable.app/delete-account";

  const authContext = useContext(AuthContext);
  const currentUserData = authContext.currentUserData as CurrentUserData;
  const {accountsData, setAccountsData} = authContext;

  const splitCurrency = props.accountData.currency.split(" ");

  const [showAddAccountPrompt, setShowAddAccountPrompt] = useState<boolean>(false);

  const handleAccountDelete = async () => {
    try {
      const body = JSON.stringify({
        accId: props.accountData._id,
        userId: currentUserData._id
      });
        
      await fetch(deleteAccountApi, {
        method: "post",
        cache: "no-cache",
        mode: "cors",
        headers: {
          "Content-Type": "application/json"
        },
        body
      });

      const newAccountsData = accountsData.filter((account: AccountData) => account._id !== props.accountData._id);
      setAccountsData(newAccountsData);
      window.sessionStorage.setItem("Budgetify-user-accounts-data", JSON.stringify(newAccountsData));

      props.setShowDetails(false);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      {!showAddAccountPrompt && <div className="prompt">
        <div style={{maxWidth: 515}} className="prompt-box rounded w-100">
          <div className="w-100 px-sm-4 py-3 px-3 position-relative d-flex align-items-center justify-content-center">
            <div className="d-flex align-items-center justify-content-between w-100 ms-sm-5 me-5 ms-2 ">
              <h3 className="fs-4">Account Information</h3>
              <div className="d-flex align-items-center gap-1">
                <div onClick={() => setShowAddAccountPrompt(true)} className="icon p-1" role="button">
                  <MdOutlineModeEdit />
                </div>
                <div onClick={handleAccountDelete} className="icon p-1" role="button">
                  <FaRegTrashCan />
                </div>
              </div>
            </div>
            <div role="button" style={{right: 10}} onClick={() => props.setShowDetails(false)} className="position-absolute">
              <HiXMark style={{width: 30, height: 30}} />
            </div>
          </div>
          <hr className="mt-0"/>
          <div className="mx-sm-5 mx-2 px-sm-4 px-3 py-4 mb-5">
            <AccountInfoField hasLine title="Title" text={makeFirstCapitals(props.accountData.title)} />
            <AccountInfoField hasLine title="Amount" text={props.accountData.amount.toString()} />
            <AccountInfoField hasLine title="Currency" text={`${splitCurrency[0]} (${splitCurrency[1]})`} />
            <AccountInfoField title="Description" text={props.accountData.description} />
          </div>
          <div className="d-flex justify-content-end px-4 pt-5 pb-3">
            <button onClick={() => props.setShowDetails(false)} style={{color: "var(--text)"}} className="action-button negative">Close</button>
          </div>
        </div>
      </div>}
      {showAddAccountPrompt && <AddAccountPrompt data={props.accountData} setShowAddAccountPrompt={setShowAddAccountPrompt} />}
    </>
  );
}

export default CardDetails;