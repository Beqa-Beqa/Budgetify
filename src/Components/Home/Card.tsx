import CardDetails from "./CardDetails";
import "../../CSS/Components/card.css";
import { useState } from "react";

const Card = (props: {
  accountData?: AccountData,
  classname?: string,
  onclick?: any,
  active?: boolean
}) => {
  const accData = props.accountData;

  const dividedByThousandDecimalPart = accData?.amount.toString().split(".")[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const floatPart = accData?.amount.toString().split(".")[1];
  const amount = floatPart ? dividedByThousandDecimalPart + "." + floatPart : dividedByThousandDecimalPart;

  // State for showing account details.
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // Money amount font size.
  const amountFontSize = amount && amount.length > 9 ? {fontSize: 33} : {fontSize: 53};

  return (
    <>
      <div role="button" className={`account-card ${props.active && "active"} ${props.classname} ${!accData ? "justify-content-center" : "align-items-sm-start pb-3"} `}>
        <div onClick={props.onclick}  className="align-items-center p-3 d-flex flex-column flex-sm-row">
          <div className={`w-100 d-flex flex-column align-items-sm-start align-items-center justify-content-center mb-3 mb-sm-0 gap-4 ${accData && "pt-3"}`}>
            <h3 className="fs-2">{accData ? accData.title : "Add Account"}</h3>
            {amount && <span style={amountFontSize}>{amount}</span>}
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
      {
        showDetails && accData && <CardDetails accountData={accData} setShowDetails={setShowDetails} />
      }
    </>
  );
}

export default Card;