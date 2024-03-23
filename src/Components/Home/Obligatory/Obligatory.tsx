import "./obligatory.css";

const Obligatory = (props: {
  obligatoryData: ObligatoryData,
  currency: string,
  onclick?: () => void,
}) => {
  const info = props.obligatoryData;

  const [startMonth, startDay, startYear] = info.startDate.split("/");
  const [endMonth, endDay, endYear] = info.endDate.split("/");

  return (
    <div onClick={props.onclick && props.onclick} className="subscription w-100 p-3 rounded d-flex align-items-center gap-3">
      <div className="w-100 h-100 d-flex flex-column gap-3">
        <div className="d-flex justify-content-between">
          <span className="fs-5">{info.title}</span>
          <span style={{color: "var(--danger)"}} className="fs-4">{info.amount}{props.currency.split(" ")[1]}</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span>Payment Dates: </span>
          <span className="fw-bold">{[startDay, startMonth, startYear].join(".")}</span>
          -
          <span className="fw-bold">{[endDay, endMonth, endYear].join(".")}</span>
        </div>
      </div>
    </div>
  );
}

export default Obligatory;