import "./indicatorButton.css";
import { GoArrowDown, GoArrowUp } from "react-icons/go";

const IndicatorButton = (props: {type: "Income" | "Expenses"}) => {
  return (
    <div style={{maxWidth: 235}} className="indicator-button w-100 p-2 rounded d-flex align-items-center gap-2">
      <div
        style={{width: 35, height: 35}}
        className={`d-flex align-items-center justify-content-center rounded-circle ${props.type === "Income" ? "income" : "expenses"}`}>
          {props.type === "Income" ?
            <GoArrowDown />
          :
            <GoArrowUp />
          }
      </div>
      <span>{props.type}</span>
    </div>
  );
}

export default IndicatorButton;