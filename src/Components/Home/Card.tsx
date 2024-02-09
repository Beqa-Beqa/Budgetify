import "./card.css";

const Card = (props: {
  title: string,
  currency: string,
  amount?: string,
}) => {
  const amountFontSize = props.amount && props.amount.length > 9 ? {fontSize: 33} : {fontSize: 53};

  return (
    <div className="account-card p-3 d-flex flex-column flex-md-row">
      <div className="w-100 d-flex flex-column align-items-start justify-content-center gap-4 pt-3 pb-4 pb-md-5">
        <h3 className="fs-2">{props.title}</h3>
        {props.amount && <span style={amountFontSize}>{props.amount}</span>}
      </div>
      <div className="account-card-currency"><span>{props.currency}</span></div>
    </div>
  );
}

export default Card;