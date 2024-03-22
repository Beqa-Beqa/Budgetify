import "./subscription.css";
import { useContext } from "react";
import { AuthContext } from "../../../Contexts/AuthContextProvider";
import { getCategoryNameById } from "../../../Functions";

const Subscription = (props: {
  subscription: SubscriptionData,
  currency: string,
  onclick?: () => void
}) => {
  const {subscription, currency} = props;
  const {categoriesData} = useContext(AuthContext);

  return (
    <div onClick={props.onclick && props.onclick} className="subscription w-100 p-3 rounded d-flex align-items-center gap-3">
      <div className="rounded subscription-title w-100 py-4 d-flex justify-content-center">
        <span className="fw-bold fs-5 text-break text-center">{getCategoryNameById(categoriesData, subscription.chosenCategories[0]) || subscription.chosenCategories[0]}</span>
      </div>
      <div className="w-100 h-100 d-flex flex-column gap-3">
        <div className="d-flex justify-content-between">
          <span className="fs-5">{subscription.title}</span>
          <span style={{color: "var(--danger)"}} className="fs-4">{subscription.amount}{currency.split(" ")[1]}</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span>Next payment date: </span>
          <span>{subscription.startDate.split("/").reverse().join(".")}</span>
          -
          <span>{subscription.endDate.split("/").reverse().join(".")}</span>
        </div>
      </div>
    </div>
  );
}

export default Subscription;