import CardDetails from "../SideMenus/CardDetails/CardDetails";
import "./card.css";
import { useState } from "react";
import { makeFirstCapitals } from "../../../Functions";
import { divideByThousands, removeThousandsCommas } from "../../../Functions";

const Card = (props: {
  accountData?: AccountData,
  classname?: string,
  onclick?: any,
  active?: boolean
}) => {
  // account data.
  const accData = props.accountData;
  // in db amount is saved either with commas or without it hence we remove commas (if exist) and add them again.
  const amount = (accData?.amount && divideByThousands(removeThousandsCommas(accData.amount as string)));
  // State for showing account details.
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // Money amount font size.
  const amountFontSize = amount ?
    amount.length > 15 ? {fontSize: 22} : amount.length > 9 ? {fontSize: 33} : {fontSize: 53} : {};

  return (
    <>
      <div role="button" className={`account-card ${props.active && "active"} ${props.classname} ${!accData ? "justify-content-center" : "align-items-sm-start pb-3"} `}>
        <div onClick={props.onclick}  className="align-items-center p-3 d-flex flex-column flex-sm-row">
          <div className={`w-100 d-flex flex-column align-items-sm-start align-items-center justify-content-center mb-3 mb-sm-0 gap-4 ${accData && "pt-3"}`}>
            <h3 className="fs-2">{accData && accData.title ? makeFirstCapitals(accData.title) : "Add Account"}</h3>
            <span style={amountFontSize}>{amount && amount}</span>
          </div>
          <div className="account-card-currency w-100 rounded-circle align-self-sm-start d-flex align-items-center justify-content-center">
            <span>{accData?.currency ? accData.currency.split(" ")[1] : "+"}</span>
          </div>
        </div>
        {
        accData && <div className="d-block text-end pe-3">
          <small 
            onClick={() => setShowDetails(true)} 
            className="details-button fw-bold p-2 rounded"
          >
              Details
          </small>
        </div>
        }
      </div>
      {accData && <CardDetails classname={showDetails ? "show" : ""} accountData={accData} setShowDetails={setShowDetails} />}
    </>
  );
}

export default Card;