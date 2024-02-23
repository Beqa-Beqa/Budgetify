import "./addAccountPrompt.css";
import { HiXMark } from "react-icons/hi2";
import FormInput from "../../../Components/Home/FormInput/FormInput";
import { FormEvent, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../../Contexts/AuthContextProvider";
import { accountExistsByTitle, clearFormStringValues, updateAccountsData } from "../../../Functions";
import ActionPrompt from "../../../Components/Home/ActionPrompt/ActionPrompt";
import { GeneralContext } from "../../../Contexts/GeneralContextProvider";
import { divideByThousands } from "../../../Functions";
import { handleAmountChange, handleDescriptionChange, handleTitleChange } from "../sharedFunctions";
import { createAccountApi, currenciesApiKey, editAccountApi, fetchCurrenciesApi } from "../../../apiURLs";

const AddAccountPrompt = (props: {
  setShowAddAccountPrompt: React.Dispatch<React.SetStateAction<boolean>>,
  data?: AccountData
}) => {
  // Auth context which provides accounts data and user data.
  const authContext = useContext(AuthContext);
  const currentUserData: CurrentUserData = (authContext.currentUserData as CurrentUserData);
  const {accountsData, setAccountsData} = authContext;

  const {setShowToastMessage} = useContext(GeneralContext);

  // Title input reference, used for UI functionality.
  const titleRef = useRef<HTMLInputElement | null>(null);

  // Currencies data fetched from api.
  const [currencies, setCurrencies] = useState<CurrencyData[]>(JSON.parse(window.localStorage.getItem("Budgetify-currencies-data") || "[]") || []);
  // Title value entered in input.
  const [title, setTitle] = useState<string>(props.data ? props.data.title : "");
  // amount holder.
  const [amount, setAmount] = useState<string>(props.data ? props.data.amount : "");
  // amount alert holder.
  const [amountAlert, setAmountAlert] = useState<InputBasicAlert>({error: false, text: ""});
  // Description field value.
  const [description, setDescription] = useState<string>(props.data ? props.data.description : "");
  // Chosen currency value.
  const [currency, setCurrency] = useState<string>(props.data ? props.data.currency : "USD $");
  // Confirmation popup state for currency change
  const [showConfirmPopUp, setShowConfirmPopUp] = useState<boolean>(false);
  // States that hold alerts.
  const [titleAlert, setTitleAlert] = useState<InputBasicAlert>({error: false, text: ""});
  const [descriptionAlert, setDescriptionAlert] = useState<InputBasicAlert>({error: false, text: ""});

  // when component mounts, if we haven't already fetched currencies data from api, fetch it.
  useEffect(() => {
    const getCurrencyData = async () => {
      // If currencies are not fetched.
      if(!currencies.length) {
        const response = await fetch(fetchCurrenciesApi, {
          method: "post", 
          headers: {"Apikey": currenciesApiKey}
        });
        const data = await response.json();
        // update currencies state.
        setCurrencies(data.Currencies);
        // save currencies in localstorage.
        window.localStorage.setItem("Budgetify-currencies-data", JSON.stringify(data.Currencies));
      }
    }

    // call async getcurrencydata function.
    getCurrencyData();
  }, []);
  
  // Check if button is disabled or not.
  // if there is no props.data this means it's not an edit prompt open
  // hence no title, title error, description error, and account exists by title error will disable button.
  // if props.data is present it means it's edit prompt.
  // if everything is same (currencies, title, description) or title is not provided button is disabled.
  const isButtonDisabled = !props.data ?
      title.trim().length && amount && !titleAlert.error && !amountAlert.error && !descriptionAlert.error && !accountExistsByTitle(accountsData, title) ? false : true
    : 
      props.data.currency === currency && props.data.title.toLocaleLowerCase() === title.toLocaleLowerCase() && props.data.description === description && props.data.amount === amount || !title.trim();

  // check if currency is changed.
  const isCurrencyChanged = props.data && props.data.currency !== currency;

  const handleSave = async () => {
    // Check if button is disabled or not (Disabled attribute can be removed from dev tools, hence this is additional protection).
    if(!isButtonDisabled) {
      // Request body to send for post request.
      // if props.data is present we send edit body on edit api.
      // edit api is waiting for body in following format:
      // {accId: string (id of account in db), fields: {title: string, currency: string, description: string}}
      // otherwise it is new account prompt.
      // account creation api is waiting for body in format:
      // {userId: string (creator of acc), accountData: {title: string, currency: string, description: string}}
      const requestBody = props.data ? JSON.stringify({
        infoForEdit: {
          accId: props.data._id,
          fields: {title, currency, description, amount}
        }
      }) : JSON.stringify({
        userId: currentUserData._id,
        accountData: {title, currency, description, amount}
      });

      // Clear title and description fields.
      clearFormStringValues(setTitle, setDescription, setAmount);

      try {
        // make post request and get result (result will be data that was saved in db).
        const result = await fetch(props.data ? editAccountApi : createAccountApi, {
          method: props.data ? "PATCH" : "POST",
          mode: "cors",
          cache: "no-cache",
          headers: {
            "Content-type": "application/json"
          },
          body: requestBody
        });

        // Result will be of type AccountData (check interfaces.d.ts in src folder).
        const accData: AccountData = await result.json();
        // if props.data is present it was an edit operation, therefore we do not add
        // anything new in accounts state. otherwise it was a new account prompt and we update state
        // and add new account.
        props.data ? updateAccountsData(accountsData, setAccountsData, {new: accData, old: props.data}, "Update")
        : updateAccountsData(accountsData, setAccountsData, {new: accData, old: undefined}, "Insert");
        // close prompt.
        props.setShowAddAccountPrompt(false);
        // close confirmation pop up.
        setShowConfirmPopUp(false);
        // set toast message.
        setShowToastMessage({show: true, text: props.data ? "The account edited successfully" : "The account created"});
      } catch (err) {
        console.error(err);
      }
    }  
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    // Prevent default action (refresh).
    event.preventDefault();
    // If currency is not changed, pop up won't be shown.
    props.data ? !isCurrencyChanged ? handleSave() : setShowConfirmPopUp(true) : handleSave();
  }

  const handlePromptConfirm = () => {
    handleSave();
    setShowConfirmPopUp(false);
  }
  
  return (
    <div className="prompt text-color">
      <div style={{maxWidth: 515}} className="prompt-box rounded py-3 w-100">
        <div className="w-100 position-relative d-flex align-items-center justify-content-center">
          <h3 className="text-center fs-4">{props.data ? "Edit" : "Create"} Account</h3>
          <div onClick={() => props.setShowAddAccountPrompt(false)} role="button" style={{right: 20}} className="position-absolute">
            <HiXMark style={{width: 30, height: 30}} />
          </div>
        </div>
        <hr className="mt-2 mb-5"/>
        <form onSubmit={handleSubmit} className="create-account-form position-relative d-flex flex-column gap-4">
          <div className="prompt-box-input-container">
            {title && <span style={{top: -40}} className="prompt-box-tooltip rounded p-2 position-absolute mx-5">{title}</span>}
            <FormInput alert={titleAlert.error} classname="input" required title="Title">
              <input
                ref={titleRef}
                value={title}
                onBlur={() => {if(titleRef.current) titleRef.current.scrollLeft = 0}}
                onChange={(e) => handleTitleChange(e, setTitle, setTitleAlert)} 
                type="text" 
                className="px-3" 
                required
                />
            </FormInput>
            {titleAlert.error && <span className="mx-5 mt-2 d-block" style={{color: "var(--danger)"}}>{titleAlert.text}</span>}
          </div>
          <FormInput classname="input" required title="Currency">
            <select onChange={(e) => setCurrency(e.target.value)} defaultValue={currency} className="px-3">
              {currencies.length && currencies.map((item: CurrencyData, key: number) => {
                return <option value={`${item.ISOCurrencyCode} ${item.CurrencySymbol}`} key={key}>{item.CurrencySymbol} {item.ISOCurrencyCode}</option>
              })}
            </select>
          </FormInput>
          <div>
            <FormInput alert={amountAlert.error} classname="input" required title="Amount">
              <input 
                value={amount} 
                onBlur={() => setAmount(divideByThousands(parseFloat(amount)))}
                onChange={(e) => handleAmountChange(e, setAmount, setAmountAlert)}
                type="text" 
                className="w-100 px-3" 
                />
            </FormInput>
            {amountAlert.error && <span className="mx-5 mt-2 d-block" style={{color: "var(--danger)"}}>{amountAlert.text}</span>}
          </div>
          <div>
            <FormInput classname="input" title="Description">
              <textarea 
                value={description} 
                onChange={(e) => handleDescriptionChange(e, setDescription, setDescriptionAlert)} 
                className="px-3"
                />
            </FormInput>
            {descriptionAlert.error && <span className="mx-5 mt-2 d-block" style={{color: "var(--danger)"}}>{descriptionAlert.text}</span>}
          </div>
          <div className="prompt-box-actions-container d-flex gap-2 justify-content-end me-3">
            <button onClick={() => props.setShowAddAccountPrompt(false)} className="action-button negative">
              Cancel
            </button>
            <button type="submit" disabled={isButtonDisabled} className="action-button positive">
              Save
            </button>
          </div>
        </form>
        {showConfirmPopUp && 
          <ActionPrompt 
            text="Are you sure you want to change the currency? It will be changed in all transactions, numbers will stay the same." 
            confirm={{action: handlePromptConfirm, text: "Ok"}}
            cancel={{action: () => setShowConfirmPopUp(false), text: "No"}}
          />
        }
      </div>
    </div>
  );
}

export default AddAccountPrompt;