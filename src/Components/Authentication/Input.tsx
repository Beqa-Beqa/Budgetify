import "./input.css";
import { Eye } from "../../Assets/Authentication/Svgs";
import { useState } from "react";

const Input = (props: {
  value: any, 
  setValue: React.Dispatch<React.SetStateAction<any>>,
  type: string,
  name: string,
  setFormAlert: React.Dispatch<React.SetStateAction<{
    email: boolean;
    password: boolean;
  }>>,
  pattern?: string
}) => {
  // Current input value holder.
  const [inputValue, setInputValue] = useState<any>("");
  // Input type state (text or password).
  const [inputType, setInputType] = useState<string>(props.type);
  // Alert message state
  const [alert, setAlert] = useState<string>("");

  // Patter which input value should match.
  const pattern = props.pattern;

  // Handle blur event (outside click).
  const handleBlur = () => {
    if(!inputValue) {
      // If input field is empty
      // Set alert
      setAlert("Required field is empty");
      // Update parent state respectively.
      props.setFormAlert(prev => {
        return props.name === "Email" ? {email: true, password: prev.password} : {email: prev.email, password: true}
      });
    } else if(pattern && !inputValue?.match(pattern)) {
      // Otherwise if pattern exists and value does not match pattern.
      // Set alert
      props.name === "Email" && setAlert("Please enter a valid Email address");
      // Update parent state respectively.
      props.setFormAlert(prev => {
        return props.name === "Email" ? {email: true, password: prev.password} : {email: prev.email, password: true}
      });
    } else {
      // Otherwise
      // Remove alert.
      setAlert("");
      // Update parent state accordingly.
      props.setFormAlert(prev => {
        return props.name === "Email" ? {email: false, password: prev.password} : {email: prev.email, password: false}
      });
    }
  }

  return (
    <div className="input-container w-100 d-flex flex-column gap-1">
      <div className="d-flex align-items-center">
        <input
          onBlur={handleBlur}
          required
          title={props.name}
          className={`input ${alert && "alert"} px-3`}
          onChange={(e) => {props.setValue(e.target.value); setInputValue(e.target.value)}} 
          value={props.value} 
          type={inputType}
        />
        <span className="floating-placeholder">{props.name}</span>
        {/* If type is password, render eye icon for input field*/}
        {props.type === "password" && 
          <img onClick={() => {
            setInputType(prev => prev === "text" ? "password" : "text")
          }} role="button" className="position-absolute eye-icon" style={{right: 15}} src={Eye} alt="eye" />
        }
      </div>
      {/* If alert exists, display it */}
      {alert && <span className="alert-message">{alert}</span>}
    </div>
  );
}

export default Input;