import "./statisticsHeader.css";

const StatisticsHeader = (props: {
  fields: string[]
}) => {
  const {fields} = props;

  return (
    <div style={{backgroundColor: "var(--button-light)"}} className="p-3 w-100 rounded-top-4 d-flex align-items-center">
      {fields.map(field => {
        return <span className="fw-bold fs-5 w-100 mx-3" key={field}>{field}</span>
      })}
    </div>
  );
}

export default StatisticsHeader;