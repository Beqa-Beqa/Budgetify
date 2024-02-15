import "../../CSS/Containers/addAccountPrompt.css";
import { HiXMark } from "react-icons/hi2";
import FormInput from "../../Components/Home/FormInput";
import { ChangeEvent, FormEvent, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../Contexts/AuthContextProvider";
import { accountExistsByTitle } from "../../Functions";
import ActionPrompt from "../../Components/Home/ActionPrompt";
import { GeneralContext } from "../../Contexts/GeneralContextProvider";

const AddAccountPrompt = (props: {
  setShowAddAccountPrompt: React.Dispatch<React.SetStateAction<boolean>>,
  data?: AccountData
}) => {
  // Currencies api.
  const fetchCurrenciesApi = "https://api.cloudmersive.com/currency/exchange-rates/list-available";
  // Key for currency api.
  const currencyApiKey = "5713676a-6942-440e-b9b8-97e260ba7100";
  // API of budgetify back for creating acc.
  const createAccountApi = `https://budgetify-back.adaptable.app/${props.data ? "edit-account" : "create-account"}`;

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
  // Description field value.
  const [description, setDescription] = useState<string>(props.data ? props.data.description : "");
  // Chosen currency value.
  const [currency, setCurrency] = useState<string>(props.data ? props.data.currency : "USD $");
  // Confirmation popup state for currency change
  const [showConfirmPopUp, setShowConfirmPopUp] = useState<boolean>(false);
  // State that holds alerts.
  const [alert, setAlert] = useState<{
    title: {
      error: boolean,
      text: string
    }, 
    description: {
      error: boolean,
      text: string
    }
  }>({description: {error: false, text: ""}, title: {error: false, text: ""}});

  // when component mounts, if we haven't already fetched currencies data from api, fetch it.
  useEffect(() => {
    const getCurrencyData = async () => {
      // If currencies are not fetched.
      if(!currencies.length) {
        const response = await fetch(fetchCurrenciesApi, {
          method: "post", 
          headers: {"Apikey": currencyApiKey}
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

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Prevent default change actions which may cause bugs.
    e.preventDefault();
    const value = e.target.value;
    // update title state.
    setTitle(value);
    // Check if characters length exceeds 128.
    const maxCharErr = value.length > 128;
    // pattern check. (letters from all alphabet, digits and whitespaces except special symbols.)
    const charErr = !value.match(/^[\p{L}\p{N}\p{Zs}]+$/gmu);

    // Alert updates according to the error reason.
    setAlert(prev => {return {
      description: prev.description,
      title: {
        error: maxCharErr || charErr,
        text: maxCharErr ? "Maximum number of characters reached." :
              charErr ? "Invalid Title entered. Please check it." : ""
      }
    }});
  } 

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    // Prevent default behavior.
    e.preventDefault();
    const value = e.target.value;
    // Update description state.
    setDescription(value);
    // Check if characters exceed 256.
    const maxCharErr = value.length > 256;

    // Update alert.
    setAlert(prev => {return {
      description: {
        error: maxCharErr, 
        text: maxCharErr ? "Maximum number of characters reached." : ""
      },
      title: prev.title
    }});
  }
  
  // Check if button is disabled or not.
  // if there is no props.data this means it's not an edit prompt open
  // hence no title, title error, description error, and account exists by title error will disable button.
  // if props.data is present it means it's edit prompt.
  // if everything is same (currencies, title, description) or title is not provided button is disabled.
  const isButtonDisabled = !props.data ?
      title.length && !alert.title.error && !alert.description.error && !accountExistsByTitle(accountsData, title) ? false : true
    : 
      props.data.currency === currency && props.data.title.toLocaleLowerCase() === title.toLocaleLowerCase() && props.data.description === description || !title;

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
          fields: {title, currency, description}
        }
      }) : JSON.stringify({
        userId: currentUserData._id,
        accountData: {title, currency, description}
      });

      // Clear title and description fields.
      setTitle("");
      setDescription("");

      try {
        // make post request and get result (result will be data that was saved in db).
        const result = await fetch(createAccountApi, {
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
        const newData = props.data ? [...accountsData] : [...accountsData, accData];
        // if it was edit prompt, change current account data with new data (server will respond with new changed data).
        if(props.data) newData[newData.indexOf(props.data)] = accData;
        // Update accounts data state. (for immediate visual update purposes).
        setAccountsData(newData);
        // update sessionStorage.
        window.sessionStorage.setItem("Budgetify-user-accounts-data", JSON.stringify(newData));
        // close prompt.
        props.setShowAddAccountPrompt(false);
        // close confirmation pop up.
        setShowConfirmPopUp(false);
        // set toast message.
        setShowToastMessage({show: true, text: props.data ? "The account edited successfuly" : "The account created"});
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
            <FormInput alert={alert.title.error} classname="input" required title="Title">
              <input
                ref={titleRef}
                value={title}
                onBlur={() => {if(titleRef.current) titleRef.current.scrollLeft = 0}}
                onChange={(e) => handleTitleChange(e)} 
                type="text" 
                className="px-3" 
                required
                />
            </FormInput>
            {alert.title.error && <span className="mx-5 mt-2 d-block" style={{color: "var(--danger)"}}>{alert.title.text}</span>}
          </div>
          <FormInput classname="input" required title="Currency">
            <select onChange={(e) => setCurrency(e.target.value)} defaultValue={currency} className="px-3">
              {currencies.length && currencies.map((item: CurrencyData, key: number) => {
                return <option value={`${item.ISOCurrencyCode} ${item.CurrencySymbol}`} key={key}>{item.CurrencySymbol} {item.ISOCurrencyCode}</option>
              })}
            </select>
          </FormInput>
          <div>
            <FormInput classname="input" title="Description">
              <textarea 
                value={description} 
                onChange={(e) => handleDescriptionChange(e)} 
                className="px-3"
                />
            </FormInput>
            {alert.description.error && <span className="mx-5 mt-2 d-block" style={{color: "var(--danger)"}}>{alert.description.text}</span>}
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