import { FormEvent, useState } from "react";
import "../CSS/authentication.css";
import Input from "../Components/Authentication/Input";
import { Xmark } from "../Assets/Authentication/Svgs";

const Authentication = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [formAlert, setFormAlert] = useState<{email: boolean, password: boolean}>({email: false, password: false});
  const [showToast, setShowToast] = useState<boolean>(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowToast(true);
  }

  return (
    <div className="authentication d-flex justify-content-center align-items-center">
      <div className="authentication-box d-flex flex-column align-items-center gap-5 py-5 px-3">
        <h1 className="logo">Budgetify</h1>
        <div className="d-flex flex-column gap-2 w-100 align-items-center">
          {showToast && <div className="toast-message px-3">
            <span>Incorrect email or password</span>
            <img role="button" onClick={() => setShowToast(false)} style={{width: 15, height: 15}} src={Xmark} alt="x mark" />
          </div>}
          <form onSubmit={(e) => handleSubmit(e)} className="authentication-box-form d-flex flex-column align-items-center gap-4 w-100">
              <Input
                setFormAlert={setFormAlert}
                pattern="^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$" 
                name="Email"
                type="string" 
                value={email} 
                setValue={setEmail} 
              />
              <Input
                setFormAlert={setFormAlert}
                name="Password" 
                type="password" 
                value={password} 
                setValue={setPassword} 
              />
              <button disabled={!formAlert.email && !formAlert.password && email && password ? false : true} type="submit" className="button">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Authentication;