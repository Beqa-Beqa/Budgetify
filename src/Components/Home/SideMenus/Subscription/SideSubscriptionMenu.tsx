import "./sideSubscriptionMenu.css";
import { MdOutlineModeEdit } from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";
import { HiXMark } from "react-icons/hi2";
import AccountInfoField from "../../AccountInfoFIeld/AccountInfoFIeld";
import { useContext, useState } from "react";
import { getCategoryNameById, updateSubscriptionsData } from "../../../../Functions";
import { AuthContext } from "../../../../Contexts/AuthContextProvider";
import AddSubscriptionPrompt from "../../../../Containers/Home/AddSubscriptionPrompt/AddSubscriptionPrompt";
import ActionPrompt from "../../ActionPrompt/ActionPrompt";
import { deleteSubscriptionApi } from "../../../../apiURLs";
import { GeneralContext } from "../../../../Contexts/GeneralContextProvider";

const SideSubscriptionMenu = (props: {
  subscriptionInfo: SubscriptionData | null,
  accountData: AccountData,
  setShowSideSubscriptionMenu: React.Dispatch<React.SetStateAction<{
    show: boolean;
    data: SubscriptionData | null;
  }>>,
  classname?: string
}) => {
  const iconSizes = {width: 25, height: 25};
  const info = props.subscriptionInfo;
  const currency = (props.accountData as AccountData).currency;

  const {categoriesData, subscriptionsData, setSubscriptionsData} = useContext(AuthContext);
  const {setShowToastMessage} = useContext(GeneralContext);

  const [showEditPrompt, setShowEditPrompt] = useState<boolean>(false);
  const [showDeletePrompt, setShowDeletePrompt] = useState<boolean>(false);

  const handleDelete = async () => {
    if(info) {
      // if we have subscription info present
      // body to send for subscription delete request
      const subscriptionBody = JSON.stringify({
        subscriptionId: info._id, 
        belongsToAccountWithId: info.belongsToAccountWithId
      });

      try {
        // delete subscription request
        await fetch(deleteSubscriptionApi, {
          method: "POST",
          cache: "no-cache",
          mode: "cors",
          headers: {
            "Content-Type": "application/json"
          },
          body: subscriptionBody
        });

        // update subscriptions data
        updateSubscriptionsData(subscriptionsData, setSubscriptionsData, {new: info, old: undefined}, "Delete");
        // show confirmation message
        setShowToastMessage({show: true, text: "Subscription was successfully removed"});
        // close delete confirmation prompt
        setShowDeletePrompt(false);
        // close transaction menu
        props.setShowSideSubscriptionMenu({data: null, show: false});
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
            <h3 className="fs-4">Subscription Information</h3>
            <div className="d-flex gap-2">
              <div onClick={() => setShowEditPrompt(true)} role="button">
                <MdOutlineModeEdit style={iconSizes} />
              </div>
              <div onClick={() => setShowDeletePrompt(true)} role="button">
                <FaRegTrashCan style={iconSizes} />
              </div>
              <div role="button" onClick={() => props.setShowSideSubscriptionMenu({show: false, data: null})}>
                <HiXMark style={iconSizes} />
              </div>
            </div>
          </div>
          {info && (
            <>
              <div className="mt-5 d-flex flex-column gap-4">
                <div className="d-flex align-items-center justify-content-between">
                  <h4 className="fs-4">{info.title}</h4>
                  <span style={{color: "var(--danger)"}} className="fs-3">{info.amount}{currency.split(" ")[1]}</span>
                </div>
                <div className="d-flex align-items-center flex-wrap gap-4">
                  {info.chosenCategories.map((category: string, key: number) => {
                    return <div style={{maxWidth: 160, border: "1px solid var(--border)"}} className="py-4 w-100 rounded d-flex justify-content-center align-items-center" key={key}>
                      <span className="fw-bold text-center text-break px-2">{getCategoryNameById(categoriesData, category) || category}</span>
                    </div>
                  })}
                </div>
              </div>
              <div className="mt-5 d-flex flex-column">
                <AccountInfoField title="Payment Dates" text={`${info.startDate} - ${info.endDate}`} hasLine />
                <AccountInfoField title="Description" text={info.description || ""} />
              </div>
            </>
          )}
        </div>
      </div>
      <AddSubscriptionPrompt classname={`${showEditPrompt && "show"}`} subscriptionInfo={info ? info : undefined} accountData={props.accountData as AccountData} setShowAddSubscriptionPrompt={setShowEditPrompt} />
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

export default SideSubscriptionMenu;