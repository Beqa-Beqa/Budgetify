import { useContext, useState } from "react";
import "./authentication.css";
import Input from "../../Components/Authentication/Input";
import { Xmark } from "../../Assets/Authentication/Svgs";
import { AuthContext } from "../../Contexts/AuthContextProvider";
import { loginApi } from "../../apiURLs";
import { GeneralContext } from "../../Contexts/GeneralContextProvider";
import Loading from "../../Components/Loading/Loading";

const Authentication = () => {
  const {
    setCurrentUserData, setAccountsData, setTransactionsData,
    setCategoriesData, setSubscriptionsData, setPiggyBanksData,
    setObligatoriesData
  } = useContext(AuthContext);
  const {isLoading, setIsLoading} = useContext(GeneralContext);

  // Email value holder state.
  const [email, setEmail] = useState<string>("");
  // Pass value holder state.
  const [password, setPassword] = useState<string>("");
  // State that updates according to alerts, whether alert is set in email or in password field.
  const [formAlert, setFormAlert] = useState<{email: boolean, password: boolean}>({email: false, password: false});
  // Showtoast state that dictates wheter to show toast message or not.
  const [showToast, setShowToast] = useState<boolean>(false);

  // Submit handler
  const handleSubmit = async (e: any) => {
    // Prevent default form submit action (refresh).
    e.preventDefault();
    setIsLoading(true);
    try {
      // Stringify body to send it as post request.
      const body = JSON.stringify({email, password});

      // Make post request
      const response = await fetch(loginApi, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json"
        },
        body
      });
      const responseData = await response.json();
      // responseData will be in the following format: {CurrentUserData type object}
      const userData: CurrentUserData = responseData.credentialRes;
      const accountsData: AccountData[] = responseData.accountsData;
      const transactionsData: TransactionData[] = responseData.transactionsData;
      const categoriesData: CategoryData[] = responseData.categoriesData;
      const subscriptionsData: SubscriptionData[] = responseData.subscriptionsData;
      const piggyBanksData: PiggyBankData[] = responseData.piggyBanksData;
      const obligatoriesData: ObligatoryData[] = responseData.obligatoryData;

      // If response data res array is empty then show toast message and return.
      if(!Object.keys(userData).length) {
        setShowToast(true);
        return;
      };

      // Save user info in session storage and update parent state.
      window.sessionStorage.setItem("Budgetify-user-data", JSON.stringify(userData));
      window.sessionStorage.setItem("Budgetify-user-accounts-data", JSON.stringify(accountsData));
      window.sessionStorage.setItem("Budgetify-user-transactions-data", JSON.stringify(transactionsData));
      window.sessionStorage.setItem("Budgetify-user-categories-data", JSON.stringify(categoriesData));
      window.sessionStorage.setItem("Budgetify-user-subscriptions-data", JSON.stringify(subscriptionsData));
      window.sessionStorage.setItem("Budgetify-user-piggy-banks-data", JSON.stringify(piggyBanksData));
      window.sessionStorage.setItem("Budgetify-user-obligatories-data", JSON.stringify(obligatoriesData));
      setCurrentUserData(userData);
      setAccountsData(accountsData);
      setTransactionsData(transactionsData);
      setCategoriesData(categoriesData);
      setSubscriptionsData(subscriptionsData);
      setPiggyBanksData(piggyBanksData);
      setObligatoriesData(obligatoriesData);
    } catch (err) {
      setShowToast(true);
    }

    setIsLoading(false);
  }

  const isButtonDisabled = !formAlert.email && !formAlert.password && email && password ? false : true;

  return (
    <>
      <main className="authentication d-flex justify-content-center align-items-center">
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
                <button disabled={isButtonDisabled} type="submit" className="button">Login</button>
            </form>
          </div>
        </div>
      </main>
      {isLoading && <Loading />}
    </>
  );
}

export default Authentication;