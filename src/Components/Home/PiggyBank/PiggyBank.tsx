import "./piggyBank.css";
import { PiggyIcon } from "../../../Assets/Home";
import { useState } from "react";
import AddPiggyAmount from "../../../Containers/Home/AddPiggyBankPrompt/AddPiggyAmount";
import { removeThousandsCommas } from "../../../Functions";

const PiggyBank = (props: {
  piggyBankData: PiggyBankData,
  onclick: () => void,
  currency: string,
  classname?: string
}) => {
  // piggy progress bar width
  const piggyProgressWidth = props.piggyBankData.currentAmount !== "0.00" ?
                             (removeThousandsCommas(props.piggyBankData.currentAmount) / removeThousandsCommas(props.piggyBankData.goalAmount) * 100).toFixed() + "%" : 0;

  // add amount prompt state
  const [showAddAmountPrompt, setShowAddAmountPrompt] = useState<boolean>(false);

  // plus icon click handler
  const handlePlusIconClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // stop propagation (stop parent element onclick event to fire on plus icon click (plus icon is child))
    event.stopPropagation();
    setShowAddAmountPrompt(true);
  }

  return (
    <>
      <div onClick={props.onclick} role="button" className={`${props.classname} w-100 piggy-bank-button rounded d-flex align-items-center gap-2`}>
        <div className="piggy-bank-icon"><img src={PiggyIcon} alt="piggy icon" /></div>
        <div className="w-100 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start">
            <div className="d-flex flex-column">
              <span className="fs-5 text-break">{props.piggyBankData.goal}</span>
              <span>{props.piggyBankData.currentAmount} / {props.piggyBankData.goalAmount} {props.currency.split(" ")[1]}</span>
            </div>
            <div onClick={(e) => handlePlusIconClick(e)} className="piggy-bank-add-icon user-select-none">+</div>
          </div>
          <div className="w-100 piggy-progress-bar-background mt-1 rounded-5">
            <div style={{width: piggyProgressWidth}} className="p-1 piggy-progress-bar-progress rounded-5" />
          </div>
        </div>
      </div>
      <AddPiggyAmount setShowAddAmountPrompt={setShowAddAmountPrompt} piggyBankInfo={props.piggyBankData} currency={props.currency.split(" ")[1]} classname={showAddAmountPrompt ? "show" : ""} />
    </>
  );
}

export default PiggyBank;