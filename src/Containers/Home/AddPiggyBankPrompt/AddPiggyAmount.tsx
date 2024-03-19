import { useState, useEffect, useContext } from "react";
import "./addPiggyBankPrompt.css";
import { HiXMark } from "react-icons/hi2";
import FormInput from "../../../Components/Home/FormInput/FormInput";
import { clearFormStringValues, divideByThousands, getGlobalTimeUnix, removeThousandsCommas, updateAccountsData, updatePiggyBanksData } from "../../../Functions";
import { handleAmountChange, handleDateChange } from "../sharedFunctions";
import { editAccountApi, editPiggyBankApi } from "../../../apiURLs";
import { AuthContext } from "../../../Contexts/AuthContextProvider";
import { GeneralContext } from "../../../Contexts/GeneralContextProvider";

const AddPiggyAmount = (props: {
  setShowAddAmountPrompt: React.Dispatch<React.SetStateAction<boolean>>,
  piggyBankInfo: PiggyBankData,
  currency: string,
  classname?: string
}) => {
  // piggy info
  const info = props.piggyBankInfo;

  // context information
  const {piggyBanksData, setPiggyBanksData, accountsData, setAccountsData} = useContext(AuthContext);
  const {setShowToastMessage} = useContext(GeneralContext);
  // account found with the id that piggy belongs to.
  const acc = accountsData.find(ac => ac._id === info.belongsToAccountWithId);

  // current date
  const [curDate, setCurDate] = useState<string>("");

  // get current global time 
  useEffect(() => {
    // due to js getting date from OS, when date is changed on client's device
    // this will provide is with incorrect data, therefore we need more reliable source.
    const getDate = async () => {
      if(typeof curDate !== "string") {
        // get data.
        const currentTime = await getGlobalTimeUnix();
        // get year, month and day.
        const dateToSave = new Date(currentTime).toLocaleString().split(",")[0];
        // update date state.
        setCurDate(dateToSave);
        // save date to sessionstorage.
        window.sessionStorage.setItem("budgetify-current-date", JSON.stringify(dateToSave));
      }
    }

    getDate();
  }, []);

  // amount and amount alert states.
  const [amount, setAmount] = useState<string>("");
  const [amountAlert, setAmountAlert] = useState<InputBasicAlert>({error: false, text: ""});
  // date and date alert states.
  const [date, setDate] = useState<string>("");
  const [dateAlert, setDateAlert] = useState<InputBasicAlert>({error: false, text: ""});
  // required alert (empty field) and is button disabled states.
  const [showRequiredAlert, setShowRequiredAlert] = useState<boolean>(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);

  // this useffect makes button active when fields are filled and no errors are present.
  useEffect(() => {
    date && amount && !dateAlert.error && !amountAlert.error && setIsButtonDisabled(false);
  }, [date, amount, amountAlert.error, dateAlert.error]);

  // clear values and alerts actions
  const clearValues = () => clearFormStringValues(setAmount, setDate);
  const clearAlerts = () => {
    setAmountAlert({error: false, text: ""});
    setDateAlert({error: false, text: ""});
  }

  // handle cancel
  const handleCancel = () => {
    clearValues();
    clearAlerts();
    // close add transacion prompt
    setShowRequiredAlert(false);
    props.setShowAddAmountPrompt(false);
  }

  // check if mandatories are filled
  const mandatoriesFilled = amount && date ? true : false;

  // handle save
  const handleSave = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if(mandatoriesFilled) {
      if (!amountAlert.error && !dateAlert.error) {
        // if mandatories are filled and no errors.
        try {
          // new current amount to save for piggy bank
          const newCurrentAmount = divideByThousands(removeThousandsCommas(info.currentAmount) + removeThousandsCommas(amount));
          // piggy body
          const piggyBody = JSON.stringify({
            belongsToAccountWithId: info.belongsToAccountWithId,
            piggyBankId: info._id,
            fields: {currentAmount: newCurrentAmount, payments: [...info.payments, {amount, date}]}
          });


          if(acc) {
            // new account amount (subtract amount which is added to piggy bank from the account)
            const newAccAmount = divideByThousands(removeThousandsCommas(acc.amount) - removeThousandsCommas(amount));

            // acc body
            const accountBody = JSON.stringify({
              infoForEdit: {
                accId: info.belongsToAccountWithId,
                fields: {amount: newAccAmount}
              }
            });

            // account edit request
            const accountRes = await fetch(editAccountApi, {
              method: "PATCH",
              mode: "cors",
              cache: "no-cache",
              headers: {
                "Content-Type": "application/json"
              },
              body: accountBody
            });

            // account
            const account = await accountRes.json();
            // update info in cache and state
            updateAccountsData(accountsData, setAccountsData, {new: account, old: acc}, "Update");
          }

          // piggy bank edit request.
          const piggyRes = await fetch(editPiggyBankApi, {
            method: "PATCH",
            mode: "cors",
            cache: "no-cache",
            headers: {
              "Content-Type": "application/json"
            },
            body: piggyBody
          });
          // edited piggy
          const piggy = await piggyRes.json();
          // update info in state and cache
          updatePiggyBanksData(piggyBanksData, setPiggyBanksData, {new: piggy, old: info}, "Update");
          // clear values
          clearValues();
          // close prompt
          props.setShowAddAmountPrompt(false);
          // set toast message
          setShowToastMessage({show: true, text: "Money has been succesffully added to piggy bank"});
        } catch (err) {
          console.error(err);
        }
      }
    } else {
      setShowRequiredAlert(true);
      setIsButtonDisabled(true);
    }
  }

  return (
    <div className={`${props.classname === "show" && "prompt"}`}>
      <div className={`prompt-box ${props.classname} w-100 d-flex flex-column align-items-center gap-5 p-2 p-lg-4`}>
        <div className="d-flex align-items-center justify-content-between w-100">
          <h2 className="fs-4">Add money to Piggy Bank</h2>
          <div onClick={handleCancel} role="button">
            <HiXMark style={{width: 30, height: 30}}/>
          </div>
        </div>
        <form className="w-100 d-flex flex-column align-items-center gap-4">
          <div className="w-100 d-flex flex-column align-items-center">
            <FormInput disabled classname="w-100 input" title="Goal">
              <input
                disabled
                value={info.goal}
                type="text" 
                className="px-3" 
              />
            </FormInput>
          </div>
          <div className="w-100 d-flex flex-column align-items-center position-relative">
            <FormInput disabled classname="w-100 input" title="Amount">
              <span className="position-absolute h-100 d-flex align-items-center ps-2">{props.currency}</span>
              <input 
                disabled
                value={info.goalAmount}
                type="text"
                placeholder="0.00"
                className="px-4" />
            </FormInput>
          </div>
          <div className="w-100 d-flex flex-column align-items-center">
            <FormInput alert={amountAlert.error || (showRequiredAlert && !amount)} required classname="w-100 input" title="Amount">
              <span className="position-absolute h-100 d-flex align-items-center ps-2 fw-bold">{props.currency}</span>
              <input 
                value={amount}
                onBlur={() => setAmount(divideByThousands(parseFloat(amount)))}
                onChange={(e) => handleAmountChange(e, setAmount, setAmountAlert)} 
                required 
                type="text" 
                className="px-4" />
            </FormInput>
            {amountAlert.error && <span className="w-100 mt-2" style={{color: "var(--danger)"}}>{amountAlert.text}</span>}
            {showRequiredAlert && !amount && <span className="w-100 mt-2" style={{color: "var(--danger)"}}>Amount is required field!</span>}
          </div>
          <div className="w-100 d-flex flex-column align-items-center">
            <FormInput alert={dateAlert.error || (showRequiredAlert && !date)} required classname="w-100 input" title="Payment Date">
              <input 
                value={date}
                onChange={(e) => {handleDateChange(e, curDate, setDate, setDateAlert)}}
                className="px-3"
                type="date"
              />
            </FormInput>
            {dateAlert.error && <span style={{color: "var(--danger)"}} className="w-100 mt-2">{dateAlert.text}</span>}
            {showRequiredAlert && !date && <span className="w-100 mt-2" style={{color: "var(--danger)"}}>Date is required field!</span>}
          </div>
        </form>
        <div className="w-100 mt-auto d-flex justify-content-end gap-3">
          <button onClick={(e) => {e.preventDefault(); handleCancel()}} className="action-button negative">Cancel</button>
          <button disabled={isButtonDisabled} onClick={(e) => handleSave(e)} className="action-button positive" type="submit">Save</button>
        </div>
      </div>
    </div>
  );
}

export default AddPiggyAmount;