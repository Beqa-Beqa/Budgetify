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
  const [inputValue, setInputValue] = useState<any>("");
  const [inputType, setInputType] = useState<string>(props.type);
  const [alert, setAlert] = useState<string>("");

  const pattern = props.pattern;

  const handleBlur = () => {
    if(!inputValue) {
      setAlert("Required field is empty");
      props.setFormAlert(prev => {
        return props.name === "Email" ? {email: true, password: prev.password} : {email: prev.email, password: true}
      });
    } else if(pattern && !inputValue?.match(pattern)) {
      props.name === "Email" && setAlert("Please enter a valid Email address");
      props.setFormAlert(prev => {
        return props.name === "Email" ? {email: true, password: prev.password} : {email: prev.email, password: true}
      });
    } else {
      setAlert("");
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
        {props.type === "password" && 
          <img onClick={() => {
            setInputType(prev => prev === "text" ? "password" : "text")
          }} role="button" className="position-absolute eye-icon" style={{right: 15}} src={Eye} alt="eye" />
        }
      </div>
      {alert && <span className="alert-message">{alert}</span>}
    </div>
  );
}

export default Input;