import { useState } from "react";
import { Eye } from "../Assets/Authentication/Svgs";
import "../Assets/CSS/authentication.css";

const Authentication = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<{type: string, value: string}>({type: "password", value: ""});

  return (
    <div className="authentication d-flex justify-content-center align-items-center">
      <div className="authentication-box d-flex flex-column align-items-center gap-5 py-5 px-3">
        <h1 className="logo">Budgetify</h1>
        <form className="authentication-box-form d-flex flex-column align-items-center gap-4 w-100">
          <input 
            className="input px-3" 
            onChange={(e) => setEmail(e.target.value)} 
            value={email} 
            type="text" 
            placeholder="Email" 
          />
          <div style={{maxWidth: 350}} className="w-100 d-flex align-items-center position-relative">
            <input className="input d-block mx-auto px-3" 
              onChange={(e) => setPassword(prev => {
                return {
                  type: prev.type,
                  value: e.target.value
                }
              })} 
              value={password.value} 
              type={password.type} 
              placeholder="Password"
            />
            <img onClick={() => setPassword(prev => {return {
                  type: prev.type === "password" ? "text" : "password",
                  value: prev.value
                }
              })
            } role="button" className="position-absolute eye-icon" style={{right: 15}} src={Eye} alt="eye" />
          </div>
          <button type="submit" className="button">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Authentication;