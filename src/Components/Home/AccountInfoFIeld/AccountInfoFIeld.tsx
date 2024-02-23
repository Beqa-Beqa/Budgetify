const AccountInfoField = (props: {
  title: string,
  text: string,
  hasLine?: boolean
}) => {
  return (
    <div className="w-100">
      <div className="d-flex w-100">
        <span className="fw-bold w-25">{props.title}:</span>
        <span className="w-50 ms-5">{props.text}</span>
      </div>
      {props.hasLine && <hr />}
    </div>
  );
}

export default AccountInfoField;