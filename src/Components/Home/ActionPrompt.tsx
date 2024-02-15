import { HiXMark } from "react-icons/hi2";

const ActionPrompt = (props: {
  text: string,
  confirm: {action: () => void | Promise<void>, text: string},
  cancel: {action: () => void | Promise<void>, text: string}
  head?: string
}) => {
  return (
    <div className="prompt">
      <div className="prompt-box rounded">
        {props.head && 
          <>
            <div className="d-flex justify-content-between align-items-center p-3">
              <span className="fs-5">{props.head}</span>
              <div role="button" onClick={props.cancel.action}>
                <HiXMark style={{width: 23, height: 23}} />
              </div>
            </div>
            <hr className="m-0"/>
          </>
        }
        <div className="p-3">
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
    </div>
  );
}

export default ActionPrompt;