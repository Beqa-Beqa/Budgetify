import "./transaction.css";
import IndicatorButton from "../IndicatorButton/IndicatorButton";
import { GoDotFill } from "react-icons/go";
import { getCategoryNameById } from "../../../Functions";
import { useContext } from "react";
import { AuthContext } from "../../../Contexts/AuthContextProvider";

const Transaction = (props: {
  transaction: TransactionData,
  currency: string,
  onclick?: () => void
}) => {
  const {transaction, currency} = props;
  const type = transaction.transactionType as "Income" | "Expenses";
  const {categoriesData} = useContext(AuthContext);

  return (
    <div onClick={props.onclick && props.onclick} className="transaction w-100 p-3 rounded d-flex align-items-center gap-3">
      <div className="rounded transaction-title w-100 py-4 d-flex justify-content-center">
        <span className="fw-bold fs-5 text-break text-center">{getCategoryNameById(categoriesData, transaction.chosenCategories[0]) || transaction.chosenCategories[0]}</span>
      </div>
      <div className="w-100 h-100 d-flex flex-column gap-3">
        <div className="d-flex justify-content-between">
          <span className="fs-5">{transaction.title}</span>
          <span style={{color: type === "Income" ? "var(--success)" : "var(--danger)"}} className="fs-4">{type === "Expenses" ? "-" : ""}{transaction.amount}{currency.split(" ")[1]}</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <IndicatorButton classname="h-50 mb-1" type={type} />
          <GoDotFill style={{width: 5, height: 5}} />
          <span>{transaction.date.split("-").reverse().join(".")}</span>
          {transaction.payee && <>
            <GoDotFill style={{width: 5, height: 5}} />
            <span>{transaction.payee}</span>
          </>}
        </div>
      </div>
    </div>
  );
}

export default Transaction;