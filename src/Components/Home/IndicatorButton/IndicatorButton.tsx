import "./indicatorButton.css";
import { GoArrowDown, GoArrowUp } from "react-icons/go";

const IndicatorButton = (props: {
  type: "Income" | "Expenses" | "Add Transaction" | "Add Category" | "Add Subscription",
  classname?: string, 
  onclick?: () => void,
  role?: string
}) => {
  return (
    <div
      onClick={props.onclick}
      role={props.type === "Add Transaction" || props.type === "Add Category" || props.type === "Add Subscription" ? "button" : props.role ? props.role : ""} 
      className={`indicator-button ${props.type === "Add Transaction" || props.type === "Add Category" || props.type === "Add Subscription" ? "indicator-button-clickable" : ""} ${props.classname} rounded d-flex align-items-center gap-2`}
    >
      {props.type === "Add Transaction" || props.type === "Add Category" || props.type === "Add Subscription" ? 
        <div className="indicator-button-clickable-icon">+</div>
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