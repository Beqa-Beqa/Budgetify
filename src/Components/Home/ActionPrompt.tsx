const ActionPrompt = (props: {
  text: string,
  confirm: {action: () => void | Promise<void>, text: string},
  cancel: {action: () => void | Promise<void>, text: string}
}) => {
  return (
    <div className="prompt">
      <div className="prompt-box p-3 rounded">
        <h5 className="mb-5">{props.text}</h5>
        <div className="prompt-box-actions-container d-flex justify-content-center gap-3">
          <button onClick={props.confirm.action} className="action-button negative">
            {props.confirm.text}
          </button>
          <button onClick={props.cancel.action} className="action-button positive">
            {props.cancel.text}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActionPrompt;