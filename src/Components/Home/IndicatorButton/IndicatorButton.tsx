import { PiggyIcon } from "../../../Assets/Home";
import "./indicatorButton.css";
import { GoArrowDown, GoArrowUp } from "react-icons/go";

const IndicatorButton = (props: {
  type: "Income" | "Expenses" | "Add Transaction" | "Add Category" | "Add Subscription" | "Add Piggy Bank" | "Add Obligatory",
  classname?: string, 
  onclick?: () => void,
  role?: string
}) => {
  return (
    <div
      onClick={props.onclick}
      role={props.type !== "Income" && props.type !== "Expenses"  ? "button" : props.role ? props.role : ""} 
      className={`indicator-button ${props.type !== "Income" && props.type !== "Expenses"  ? "indicator-button-clickable" : ""} ${props.classname} rounded d-flex align-items-center gap-2`}
    >
      {props.type !== "Income" && props.type !== "Expenses" ?
        props.type !== "Add Piggy Bank" ? 
          <div className="indicator-button-clickable-icon">+</div>
        :
          <div className="indicator-button-clickable-icon"><img src={PiggyIcon} alt="piggy icon" /></div>
      :
        <div
          style={{width: 35, height: 35}}
          className={`d-flex align-items-center justify-content-center rounded-circle ${props.type === "Income" ? "income" : "expenses"}`}>
            {props.type === "Income" ?
              <GoArrowDown />
            :
              <GoArrowUp />
            }
        </div>
      }
      <span>{props.type}</span>
    </div>
  );
}

export default IndicatorButton;