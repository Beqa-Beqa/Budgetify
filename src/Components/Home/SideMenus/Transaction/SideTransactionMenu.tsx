import { useContext, useState } from "react";
import "./sideTransactionMenu.css";
import { GeneralContext } from "../../../../Contexts/GeneralContextProvider";
import { HiXMark } from "react-icons/hi2";
import { MdOutlineModeEdit } from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";
import IndicatorButton from "../../IndicatorButton/IndicatorButton";
import AccountInfoField from "../../AccountInfoFIeld/AccountInfoFIeld";
import { FaImage } from "react-icons/fa";
import { GoArrowDown } from "react-icons/go";
import AddTransactionPrompt from "../../../../Containers/Home/AddTransactionPrompt/AddTransactionPrompt";

const SideTransactionMenu = (props: {
  setShowSideTransactionMenu: React.Dispatch<React.SetStateAction<{
    show: boolean;
    data: TransactionData | null;
  }>>,
  transactionInfo: TransactionData | null,
  accountData: AccountData | false,
  classname?: string
}) => {
  const {width} = useContext(GeneralContext);
  const menuWidth = width < 768 ? "w-100" : "w-50";
  const iconSizes = {width: 30, height: 30};
  const info = props.transactionInfo;
  const type = info && info.transactionType as "Income" | "Expenses" ;
  const currency = (props.accountData as AccountData).currency;

  const [showEditPrompt, setShowEditPrompt] = useState<boolean>(false);

  return (
    !showEditPrompt ? <div className={`${props.classname === "show" ? "prompt" : ""}`}>
      <div style={{overflowY: "auto"}} className={`sidemenu ${menuWidth} ${props.classname} h-100 p-2 p-sm-3 p-lg-5`}>
        <div className="w-100 d-flex justify-content-between align-items-center">
          <h3 className="fs-2">Transaction Information</h3>
          <div className="d-flex gap-3">
            <div onClick={() => setShowEditPrompt(true)} role="button">
              <MdOutlineModeEdit style={iconSizes} />
            </div>
            <div role="button">
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
                <IndicatorButton type={type!} />
                <span style={{color: type === "Income" ? "var(--success)" : "var(--danger)"}} className="fs-3">{type === "Expenses" && "-"}{info.amount}{currency.split(" ")[1]}</span>
              </div>
              <h4 className="fs-4">{info.title}</h4>
              <div className="d-flex align-items-center flex-wrap gap-4">
                {info.chosenCategories.map((category: string, key: number) => {
                  return <div style={{maxWidth: 160, border: "1px solid var(--border)"}} className="py-4 w-100 rounded d-flex justify-content-center align-items-center" key={key}>
                    <span className="fw-bold">{category}</span>
                  </div>
                })}
              </div>
            </div>
            <div className="mt-5 d-flex flex-column">
              <AccountInfoField title="Payment Date" text={info.date} hasLine />
              <AccountInfoField title="Payee" text="Unknown" hasLine />
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
    : <AddTransactionPrompt callback={() => props.setShowSideTransactionMenu({show: false, data: props.transactionInfo})} transactionData={info ? info : undefined} accountData={props.accountData as AccountData} setShowAddTransactionPrompt={setShowEditPrompt} />
    )
}

export default SideTransactionMenu;