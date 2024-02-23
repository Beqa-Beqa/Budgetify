import { useContext, useEffect, useRef, useState } from "react";
import FormInput from "../../../Components/Home/FormInput/FormInput";
import "../AddAccountPrompt/addAccountPrompt.css";
import ActionPrompt from "../../../Components/Home/ActionPrompt/ActionPrompt";
import { handleDescriptionChange, handleTitleChange, handleAmountChange } from "../sharedFunctions";
import { clearFormStringValues, divideByThousands, getGlobalTimeUnix, removeThousandsCommas, updateTransactionsData, updateAccountsData } from "../../../Functions";
import { HiXMark } from "react-icons/hi2";
import { AuthContext } from "../../../Contexts/AuthContextProvider";
import { handleTransactionTypeChange, handleDateChange, handleCategorySelect, handleCategoryUnselect } from "../sharedFunctions";
import { createTransactionApi, editAccountApi, editTransactionApi } from "../../../apiURLs";

const AddTransactionPrompt = (props: {
  setShowAddTransactionPrompt: React.Dispatch<React.SetStateAction<boolean>>,
  accountData: AccountData,
  transactionData?: TransactionData,
  callback?: () => void
}) => {
  // if info is present this prompt is for edit.
  const hasInfo = props.transactionData;

  // Current global time, retrieved after component mount.
  const [curDate, setCurDate] = useState<string>(JSON.parse(window.sessionStorage.getItem("budgetify-current-date") || "{}"));

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

  // Authcontext provides with transactions data, accounts data and their setters.
  const {transactionsData, setTransactionsData, accountsData, setAccountsData} = useContext(AuthContext);

  // Title reference.
  const titleRef = useRef<HTMLInputElement | null>(null);

  // transaction type holder state.
  const [transactionType, setTransactionType] = useState<string>(hasInfo ? hasInfo.transactionType : "");
  // title holder state.
  const [title, setTitle] = useState<string>(hasInfo ? hasInfo.title : "");
  // title alert holder.
  const [titleAlert, setTitleAlert] = useState<InputBasicAlert>({error: false, text: ""});
  // description holder.
  const [description, setDescription] = useState<string>(hasInfo && hasInfo.description ? hasInfo.description : "");
  // description alert holder.
  const [descriptionAlert, setDescriptionAlert] = useState<InputBasicAlert>({error: false, text: ""});
  // amount holder.
  const [amount, setAmount] = useState<string>(hasInfo ? hasInfo.amount : "");
  // amount alert holder.
  const [amountAlert, setAmountAlert] = useState<InputBasicAlert>({error: false, text: ""});
  // date holder.
  const [date, setDate] = useState<string>(hasInfo ? hasInfo.date : "");
  // date alert holder.
  const [dateAlert, setDateAlert] = useState<InputBasicAlert>({error: false, text: ""});
  // categories holder which were not chosen yet.
  // expense categories.
  const defExpenseCategories = ["Home", "Entertainment", "Groceries", "Clothing", "Restaurant", "Cinema"];
  // income categories.
  const defIncomeCategories = ["Salary", "Debt", "Business", "Entertainment", "Lottery"];
  // edit categories.
  const defEditCategories = hasInfo ? hasInfo.transactionType === "Income" ?  defIncomeCategories.filter((category: string) => hasInfo.chosenCategories.indexOf(category) === -1)
  : defExpenseCategories.filter((category: string) => hasInfo.chosenCategories.indexOf(category) === -1) : undefined;
  // categories state that are available for choosing.
  const [categoriesAvailable, setCategoriesAvailable] = useState<string[]>(hasInfo ? defEditCategories! : []);
  // categories that were chosen already.
  const [chosenCategories, setChosenCategories] = useState<string[]>(hasInfo ? hasInfo.chosenCategories : []);
  // cancel prompt (transaction creation).
  const [showCancelPrompt, setShowCancelPrompt] = useState<boolean>(false);
  // save prompt (transaction creation).
  const [showSavePrompt, setShowSavePrompt] = useState<boolean>(false);
  // alert holder that displays ... is required field alert.
  const [showRequiredAlert, setShowRequiredAlert] = useState<boolean>(false);

  // cancel button click handler (transaction creation).
  const handleCancel = () => {
    // show cancel prompt
    setShowCancelPrompt(false);
    // close add transacion prompt
    props.setShowAddTransactionPrompt(false);
  }
  // button disabled state holder.
  const mandatoriesFilled = transactionType && title && parseFloat(amount) && date && chosenCategories.length && true || false;
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);

  useEffect(() => {
    // if it's edit prompt and all the fields are same disable save button.
    // otherwise enable it.
    // if it's create prompt and mandatroy fields are filled, enable button.
    // useffect runs after any of the field value change.
    hasInfo ? 
      (hasInfo.amount !== amount || JSON.stringify(hasInfo.chosenCategories) !== JSON.stringify(chosenCategories) || hasInfo.date !== date
      || hasInfo.description !== description || hasInfo.title !== title || hasInfo.transactionType !== transactionType) 
        ?
          setIsButtonDisabled(false) 
        : 
          setIsButtonDisabled(true)
      :
        mandatoriesFilled && setIsButtonDisabled(false);

  }, [title, transactionType, description, date, amount, chosenCategories]);

  // Save transaction
  const handleSave = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if(mandatoriesFilled) {
      // if mandatories are filled
      if(!titleAlert.error && !descriptionAlert.error && !amountAlert.error && !dateAlert.error) {
        // and no errors are present.
        try {
          // for an edit prompt, build body for /edit-transaction endpoint
          // expected format from server: {transactionId: string, belongsToId: string, fields: {fields to update}}
          // for create prompt, build body for creating transaction.
          // expected format: {transactionData: {all the fields}}
          const transactionBody = hasInfo ? 
            JSON.stringify({
              transactionId: hasInfo._id,
              belongsToId: hasInfo.belongsToAccountWithId,
              fields: {transactionType, title, description, amount, date, chosenCategories}
            })
          :
            JSON.stringify({
              transactionData: {
                belongsToAccountWithId: props.accountData._id,
                transactionType, 
                title, 
                description, 
                amount, 
                date, 
                chosenCategories
              }
            })

          // make request.
          const transactionResult = await fetch(hasInfo ? editTransactionApi : createTransactionApi, {
            method: hasInfo ? "PATCH" : "POST",
            mode: "cors",
            cache: "no-cache",
            headers: {
              "Content-Type": "application/json"
            },
            body: transactionBody
          });

          // Amount to send is for account (when transaction is made, account balance should be updated too)
          // if it's an edit prompt and in edit we set transaction type to income and previous type was also income
          // subtract previous value to the current amount of account, and add new value that was set.
          // if it was expense perviously, add that amount to current amount and add new value to current amount.
          // if we chose expense in edit and it was income perviously, subtract pervious value to the current
          // value and subtract new value to the current value.
          // if it was chosen expense perviously and we chose expense again, add pervious value to current amount of account
          // and subtract new value to current amount of the account.
          const amountToSend = hasInfo ?
            transactionType === "Income" ?
              hasInfo.transactionType === "Income" ? removeThousandsCommas(props.accountData.amount) - removeThousandsCommas(hasInfo.amount) + removeThousandsCommas(amount)
              : removeThousandsCommas(props.accountData.amount) + removeThousandsCommas(hasInfo.amount) + removeThousandsCommas(amount)
            :
              hasInfo.transactionType === "Income" ? removeThousandsCommas(props.accountData.amount) - removeThousandsCommas(hasInfo.amount) - removeThousandsCommas(amount)
              : removeThousandsCommas(props.accountData.amount) + removeThousandsCommas(hasInfo.amount) - removeThousandsCommas(amount)
          :
            transactionType === "Income" ?
            removeThousandsCommas(props.accountData.amount) + removeThousandsCommas(amount)
            : removeThousandsCommas(props.accountData.amount) - removeThousandsCommas(amount);

          // body to send for account update request.
          const accountBody = JSON.stringify({infoForEdit: {
            accId: props.accountData._id,
            fields: {amount: amountToSend.toString()}
          }})

          // send account update request.
          const accountResult = await fetch(editAccountApi, {
            method: "PATCH",
            mode: "cors",
            cache: "no-cache",
            headers: {
              "Content-Type": "application/json"
            },
            body: accountBody
          });

          // results.
          const transaction = await transactionResult.json();
          const account = await accountResult.json();

          if(hasInfo) {
            // if it was edit, update transactions data.
            updateTransactionsData(transactionsData, setTransactionsData, {new: transaction, old: props.transactionData}, "Update");
          } else {
            // if it was creation, insert new data.
            updateTransactionsData(transactionsData, setTransactionsData, {new: transaction, old: undefined}, "Insert");
          }
          // update accounts data.
          updateAccountsData(accountsData, setAccountsData, {new: account, old: props.accountData}, "Update");

          // clear fields.
          clearFormStringValues(setTransactionType, setTitle, setAmount, setDate, setDescription);
          setChosenCategories([]);
          setCategoriesAvailable([]);
          setShowRequiredAlert(false);

          // show save prompt.
          setShowSavePrompt(true);
        } catch (err) {
          console.error(err);
        }
      }
    } else {
      // otherwise show required alert and disable button
      setShowRequiredAlert(true); 
      setIsButtonDisabled(true);
    }
  }

  return (
    <>
      <div className="prompt">
        <div style={{maxWidth: 515}} className="prompt-box w-100 rounded py-3">
          <h2 className="fs-4 mb-5 text-center">Create Transaction</h2>
          <form style={{overflow: "visible"}} className="d-flex flex-column align-items-center gap-4 px-md-5 px-2">
            <div className="w-100 d-flex flex-column align-items-center">
              <FormInput alert={showRequiredAlert && !transactionType} required classname="w-100 input" title="Transaction Type">
                <select onChange={(e) => handleTransactionTypeChange(e, setTransactionType, () => {setCategoriesAvailable(e.target.value === "Income" ? defIncomeCategories : defExpenseCategories); setChosenCategories([])})} required defaultValue={transactionType} className="px-3">
                  <option className="d-none" disabled value={""} />
                  <option value="Income">Income</option>
                  <option value="Expenses">Expenses</option>
                </select>
              </FormInput>
              {showRequiredAlert && !transactionType && <span className="w-100 mt-2" style={{color: "var(--danger)"}}>Transaction type is required field!</span>}
            </div>
            <div className="w-100 d-flex flex-column align-items-center">
              <FormInput alert={titleAlert.error || (showRequiredAlert && !title)} classname="w-100 input" required title="Title">
                <input 
                  value={title}
                  onBlur={() => {if(titleRef.current) titleRef.current.scrollLeft = 0}}
                  onChange={(e) => handleTitleChange(e, setTitle, setTitleAlert)} 
                  required 
                  type="text" 
                  className="px-3" 
                />
              </FormInput>
              {titleAlert.error && <span style={{color: "var(--danger)"}} className="w-100 mt-2">{titleAlert.text}</span>}
              {showRequiredAlert && !title && <span className="w-100 mt-2" style={{color: "var(--danger)"}}>Title is required field!</span>}
            </div>
            <div className="w-100 d-flex flex-column align-items-center justify-content-center ">
              <FormInput alert={showRequiredAlert && !chosenCategories.length} classname="w-100 input position-relative d-flex flex-column align-items-center justify-content-center" required title="Category">
                <select required value={""} onChange={() => {}} className="px-3">
                  <option className="d-none" disabled value={""} />
                  {categoriesAvailable.map((category: string, key: number) => {
                    return <option
                      value={category}
                      onClick={() => handleCategorySelect(category, categoriesAvailable, setCategoriesAvailable, chosenCategories, setChosenCategories)}
                      key={key}>{category}</option>
                  })}
                </select>
                <div style={{top: -25}} className="mx-3 align-self-start position-relative d-flex align-items-center flex-wrap gap-2">
                  {
                    chosenCategories.length ? chosenCategories.map((category: string, key: number) => {
                      return <div style={{border: "1px solid var(--border)", backgroundColor: "var(--primary)"}} className="rounded p-2 d-flex align-items-center gap-1 fw-bold" key={key}>
                        <span style={{color: "var(--text)"}}>{category}</span>
                        <div role="button" onClick={() => handleCategoryUnselect(category, categoriesAvailable, setCategoriesAvailable, chosenCategories, setChosenCategories)}>
                          <HiXMark  />
                        </div>
                      </div>
                    })
                    : null
                  }
                </div>
              </FormInput>
              {showRequiredAlert && !chosenCategories.length && <span className="w-100 mt-2" style={{color: "var(--danger)"}}>Category is required field!</span>}
            </div>
            <div className="w-100 d-flex flex-column align-items-center">
              <FormInput alert={descriptionAlert.error} classname="w-100 input" title="Description">
                <input 
                  value={description} 
                  onChange={(e) => handleDescriptionChange(e, setDescription, setDescriptionAlert)} 
                  type="text" 
                  className="px-3" 
                />
              </FormInput>
              {descriptionAlert.error && <span style={{color: "var(--danger)"}} className="w-100 mt-2">{descriptionAlert.text}</span>}
            </div>
            <div className="w-100 d-flex flex-column align-items-center">
              <FormInput alert={amountAlert.error || (showRequiredAlert && !amount)} required classname="w-100 input" title="Amount">
                <input 
                  value={amount}
                  onBlur={() => setAmount(divideByThousands(parseFloat(amount)))}
                  onChange={(e) => handleAmountChange(e, setAmount, setAmountAlert)} 
                  required 
                  type="text" 
                  className="px-3" />
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
            <div className="w-100 d-flex flex-column align-items-center">
              <FormInput classname="w-100 input" title="Attachment">
                <input type="file" className="px-3 pt-3" />
              </FormInput>
            </div>
            <div style={{width: 220}} className="d-flex gap-3">
              <button disabled={isButtonDisabled} onClick={(e) => handleSave(e)} className="action-button positive" type="submit">Save</button>
              <button onClick={(e) => {e.preventDefault(); setShowCancelPrompt(true);}} className="action-button negative">Cancel</button>
            </div>
          </form>
        </div>
      </div>
      {
        showSavePrompt && 
          <ActionPrompt
            text={hasInfo ? `A transaction has been[br]successfully updated` : `${transactionType} transaction has been[br]successfully added!`}
            cancel={{action: () => {setShowSavePrompt(false); props.setShowAddTransactionPrompt(false); props.callback && props.callback()}, text: "Ok"}}
            success
          />
      }
      {
        showCancelPrompt && 
          <ActionPrompt 
            text={`This ${transactionType.toLowerCase() || "transaction"} will not be saved.[br]Are you sure you want to cancel?`}
            confirm={{action: () => handleCancel(), text: "Yes"}}
            cancel={{action: () => setShowCancelPrompt(false), text: "No"}}
            alert
          />
      }
    </>
  );
}

export default AddTransactionPrompt;