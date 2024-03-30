import "./statisticsField.css";

const StatisticsField = (props: {
  fields: string[],
  fieldColors?: [number, string][],
  classname?: string,
  hasLine?: boolean
}) => {
  const {hasLine, fields, classname, fieldColors} = props;

  return (
    <div style={{backgroundColor: "var(--component-background)"}} className={`px-3 w-100 ${classname && classname} d-flex flex-column`}>
      <div className="w-100 d-flex justify-content-between align-items-center py-3">
        {fields.map((field, key: number) => {
          let color: string | undefined = undefined;

          if(fieldColors) {
            for(let colorArr of fieldColors) {
              const isColored = colorArr[0] === key;
              if(isColored) color = colorArr[1];
            }
          }
          
          return <span style={{textOverflow: "ellipsis", color: color ? color : "black"}} className="fs-5 w-100 mx-3" key={key}>{field}</span>
        })}
      </div>
      {hasLine && <hr className="m-0" />}
    </div>
  );
}

export default StatisticsField;