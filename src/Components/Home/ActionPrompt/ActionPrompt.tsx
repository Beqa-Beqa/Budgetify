import { HiXMark } from "react-icons/hi2";
import "./actionPrompt.css";
import React from "react";

const ActionPrompt = (props: {
  text: string,
  confirm?: {action: () => void | Promise<void>, text: string},
  cancel?: {action: () => void | Promise<void>, text: string}
  head?: string,
  alert?: boolean,
  success?: boolean
}) => {

  const renderText = (text: string) => {
    // insert newlines instead of [br]s
    return text.split("[br]").map((line: string, index: number) => {
      return <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    });
  }

  return (
    <div className="prompt d-flex justify-content-center align-items-center">
      <div style={{top: "unset", right: "unset", height: "fit-content"}} className={`prompt-box rounded ${props.alert ? "alert" : props.success ? "success" : ""}`}>
        {props.head && 
          <>
            <div className="d-flex justify-content-between align-items-center p-3">
              <span className="fs-4">{props.head}</span>
              {props.cancel && <div role="button" onClick={props.cancel.action}>
                <HiXMark style={{width: 30, height: 30}} />
              </div>}
            </div>
          </>
        }
        <div className="p-3">
          <h5 className="action-description mb-5 fs-5 text-center">{renderText(props.text)}</h5>
          <div className="prompt-box-actions-container d-flex justify-content-center gap-3">
            {props.confirm && <button onClick={props.confirm.action} className="action-button negative">
              {props.confirm.text}
            </button>}
            {props.cancel && <button onClick={props.cancel.action} className="action-button positive">
              {props.cancel.text}
            </button>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActionPrompt;