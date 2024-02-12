import AddAccountPrompt from "../../Containers/Home/AddAccountPrompt";
import "./card.css";
import { useState } from "react";

const Card = (props: {
  title: string,
  currency?: string,
  amount?: string,
  classname?: string
}) => {
  // State for to show add account prompt or not.
  const [showAddAccountPrompt, setShowAddAccountPrompt] = useState<boolean>(false);

  // Money amount font size.
  const amountFontSize = props.amount && props.amount.length > 9 ? {fontSize: 33} : {fontSize: 53};

  // Handle card click.
  const handleClick = () => props.title === "Add Account" && setShowAddAccountPrompt(true);

  return (
    <>
      <div onClick={handleClick} role="button" className={`${props.classname} ${!props.currency && "align-items-center justify-content-center"} account-card p-3 d-flex flex-column flex-sm-row`}>
        <div className={`w-100 d-flex flex-column align-items-sm-start align-items-center justify-content-center gap-4 ${props.currency ? "pt-3" : "pt-5"} pb-5`}>
          <h3 className="fs-2">{props.title}</h3>
          {props.amount && <span style={amountFontSize}>{props.amount}</span>}
        </div>
        <div className="account-card-currency w-100 rounded-circle d-flex align-items-center justify-content-center">
          <span>{props.currency ? props.currency : "+"}</span>
        </div>
      </div>
      {
        showAddAccountPrompt && <AddAccountPrompt setShowAddAccountPrompt={setShowAddAccountPrompt} />
      }
    </>
  );
}

export default Card;