import "./sideObligatoryMenu.css";
import { MdOutlineModeEdit } from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";
import { HiXMark } from "react-icons/hi2";
import { useContext, useState } from "react";
import AccountInfoField from "../../AccountInfoFIeld/AccountInfoFIeld";
import AddObligatoryPrompt from "../../../../Containers/Home/AddObligatoryPrompt/AddObligatoryPrompt";
import ActionPrompt from "../../ActionPrompt/ActionPrompt";
import { deleteObligatory, updateObligatoriesData } from "../../../../Functions";
import { AuthContext } from "../../../../Contexts/AuthContextProvider";
import { GeneralContext } from "../../../../Contexts/GeneralContextProvider";

const SideObligatoryMenu = (props: {
  obligatoryInfo: ObligatoryData | null,
  accountData: AccountData | false,
  setShowObligatoryMenu: React.Dispatch<React.SetStateAction<{
    show: boolean;
    data: ObligatoryData | null;
  }>>
  classname?: string
}) => {
  const info = props.obligatoryInfo;
  const iconSizes = {width: 25, height: 25};
  const accInfo = props.accountData as AccountData;
  const currency = accInfo.currency;

  const {obligatoriesData, setObligatoriesData} = useContext(AuthContext);
  const {setShowToastMessage} = useContext(GeneralContext);

  const [showEditPrompt, setShowEditPrompt] = useState<boolean>(false);

  const [showDeletePrompt, setShowDeletePrompt] = useState<boolean>(false);

  const handleDelete = async () => {
    try {
      if(info) {
        await deleteObligatory({belongsToAccountWithId: info.belongsToAccountWithId, obligatoryId: info._id});
        updateObligatoriesData(obligatoriesData, setObligatoriesData, {new: info, old: undefined}, "Delete");
        setShowToastMessage({show: true, text: "Obligatory deleted successfully"});
        setShowDeletePrompt(false);
        props.setShowObligatoryMenu({show: false, data: null});
      }
    } catch (err) {
      console.error(err);
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
              <div role="button" onClick={() => props.setShowObligatoryMenu({show: false, data: null})}>
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
              </div>
              <div className="mt-5 d-flex flex-column">
                <AccountInfoField title="Payment Dates" text={`${info.startDate.replace(/\//g, ".")} - ${info.endDate.replace(/\//g, ".")}`} hasLine />
                <AccountInfoField title="Description" text={info.description || ""} />
              </div>
            </>
          )}
        </div>
      </div>
      <AddObligatoryPrompt classname={`${showEditPrompt && "show"}`} obligatoryData={info ? info : undefined} accountData={accInfo} setShowAddObligatoryPrompt={setShowEditPrompt} />
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

export default SideObligatoryMenu;