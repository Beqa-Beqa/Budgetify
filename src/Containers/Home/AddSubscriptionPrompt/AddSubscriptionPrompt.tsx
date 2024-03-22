import { useContext, useRef, useState, useEffect } from "react";
import "./addSubscriptionPrompt.css";
import { HiXMark } from "react-icons/hi2";
import FormInput from "../../../Components/Home/FormInput/FormInput";
import { handleTitleChange, handleCategorySelect, handleCategoryUnselect, handleAmountChange, handleDescriptionChange, handleDateChangeAlert } from "../sharedFunctions";
import { getCategoryNameById, divideByThousands, clearFormStringValues, getGlobalTimeUnix, updateSubscriptionsData, subscriptionExistsByTitle, editSubscription, createSubscription, removeThousandsCommas } from "../../../Functions";
import { defExpenseCategories } from "../../../Data";
import { AuthContext } from "../../../Contexts/AuthContextProvider";
import ActionPrompt from "../../../Components/Home/ActionPrompt/ActionPrompt";
import { GeneralContext } from "../../../Contexts/GeneralContextProvider";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AddSubscriptionPrompt = (props: {
  setShowAddSubscriptionPrompt: React.Dispatch<React.SetStateAction<boolean>>,
  accountData: AccountData,
  subscriptionInfo?: SubscriptionData
  classname?: string
}) => {
  // context data.
  const {categoriesData, subscriptionsData, setSubscriptionsData} = useContext(AuthContext);
  const {setShowAddCategoryPrompt, setShowToastMessage} = useContext(GeneralContext);


  // info constants
  const hasInfo = props.subscriptionInfo;
  const currency = props.accountData.currency.split(" ")[1];
  const titleRef = useRef<HTMLInputElement | null>(null);


  // title holder and title error
  const [title, setTitle] = useState<string>("");
  const [titleAlert, setTitleAlert] = useState<InputBasicAlert>({error: false, text: ""});
  // amount holder and amount error
  const [amount, setAmount] = useState<string>("");
  const [amountAlert, setAmountAlert] = useState<InputBasicAlert>({error: false, text: ""});
  // description and description error
  const [description, setDescription] = useState<string>("");
  const [descriptionAlert, setDescriptionAlert] = useState<InputBasicAlert>({error: false, text: ""});
  // date info and date alerts.
  // date range, start date, end date, start date string and end date string
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [startDateString, endDateString] = dateRange.map((date: Date | null) => date && new Date(date).toLocaleString().split(",")[0]);
  const [startDateAlert, setStartDateAlert] = useState<InputBasicAlert>({error: false, text: ""});
  const [endDateAlert, setEndDateAlert] = useState<InputBasicAlert>({error: false, text: ""});


  // custom expense categories
  const customExpenseCategories = categoriesData.filter((category: CategoryData) => category.transactionType === "Expenses" && category).map((category: CategoryData) => category._id);
  const expenseCategories = [...defExpenseCategories, ...customExpenseCategories];
  // edit categories.
  const defEditCategories = hasInfo ? expenseCategories.filter((category: string) => hasInfo.chosenCategories.indexOf(category) === -1) : undefined;
  // categories state that are available for choosing.
  const [categoriesAvailable, setCategoriesAvailable] = useState<string[]>(expenseCategories);
  // categories that were chosen already.
  const [chosenCategories, setChosenCategories] = useState<string[]>([]);

  // initialize values (if edit)
  const initValues = () => {
    if(hasInfo) {
      const {title, amount, chosenCategories, dateRange, description} = hasInfo;
      setTitle(title);
      setAmount(amount);
      setChosenCategories(chosenCategories);
      defEditCategories && setCategoriesAvailable(defEditCategories);
      setDateRange(dateRange);
      description && setDescription(description);
    }
  }

  // fill info if it's edit
  useEffect(() => {
    initValues();
  }, [hasInfo]);


  // show required alert state.
  const [showRequiredAlert, setShowRequiredAlert] = useState<boolean>(false);


  // cancel prompt state
  const [showCancelPrompt, setShowCancelPrompt] = useState<boolean>(false);


  // Current global time, retrieved after component mount.
  const [curDate, setCurDate] = useState<string>("");
  // get current global time 
  useEffect(() => {
    // due to js getting date from OS, when date is changed on client's device
    // this will provide is with incorrect data, therefore we need more reliable source.
    const getDate = async () => {
      // get data.
      const currentTime = await getGlobalTimeUnix();
      // get year, month and day.
      const dateToSave = new Date(currentTime).toLocaleString().split(",")[0];
      // update date state.
      setCurDate(dateToSave);
    }

    getDate();
  }, []);


  // clear values and alerts
  const clearValues = () => {
    clearFormStringValues(setTitle, setDescription, setAmount);
    setCategoriesAvailable(expenseCategories);
    setChosenCategories([]);
    setDateRange([null, null]);
  };
  const clearAlerts = () => {
    setTitleAlert({error: false, text: ""});
    setAmountAlert({error: false, text: ""});
    setDescriptionAlert({error: false, text: ""});
    setStartDateAlert({error: false, text: ""});
    setEndDateAlert({error: false, text: ""});
    setShowRequiredAlert(false);
  }


  // cancel button click handler (subscription creation).
  const handleCancel = () => {
    if(!hasInfo) {
      clearValues();
    } else {
      initValues();
    }
    clearAlerts();
    // show cancel prompt
    setShowCancelPrompt(false);
    // close add transacion prompt
    props.setShowAddSubscriptionPrompt(false);
  }


  // form save button cancelation based on alerts and filled info.
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
  const mandatoriesFilled = title && removeThousandsCommas(amount) && chosenCategories.length && startDateString && endDateString && true || false;
  useEffect(() => {
    // if it's edit prompt and all the fields are same disable save button.
    // otherwise enable it.
    // if it's create prompt and mandatroy fields are filled, enable button.
    // useffect runs after any of the field value change.
    hasInfo ? 
      (hasInfo.amount !== amount || JSON.stringify(hasInfo.chosenCategories) !== JSON.stringify(chosenCategories) || 
      hasInfo.description !== description || hasInfo.title !== title || hasInfo.startDate !== startDateString || hasInfo.endDate !== endDateString) 
        ?
          setIsButtonDisabled(false) 
        : 
          setIsButtonDisabled(true)
      :
        mandatoriesFilled && setIsButtonDisabled(false);

      !hasInfo && subscriptionExistsByTitle(subscriptionsData, title) && setTitleAlert({error: true, text: "You already have a subscription with this title"});

  }, [title, description, amount, chosenCategories, dateRange]);


  // handle save.
  const handleSave = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    if(mandatoriesFilled) {
      // if mandatories are filled
      if(!titleAlert.error && !descriptionAlert.error && !amountAlert.error && !startDateAlert.error && !endDateAlert.error) {
        try {
          // subscription variable that's used for updating data
          let subscription;

          if(hasInfo) {
            // if it's edit create edit body
            const rqbody = {
              subscriptionId: hasInfo._id,
              belongsToAccountWithId: hasInfo.belongsToAccountWithId,
              fields: {title, description, amount, dateRange, startDate: startDateString, endDate: endDateString, chosenCategories}
            }

            // send edit request
            subscription = await editSubscription(rqbody);
          } else {
            // otherwise create creation body
            const rqbody = {
              belongsToAccountWithId: props.accountData._id,
              title, 
              description, 
              amount, 
              dateRange,
              startDate: startDateString,
              endDate: endDateString, 
              chosenCategories
            }

            // send creation request
            subscription = await createSubscription(rqbody);
          }

          if(hasInfo) {
            updateSubscriptionsData(subscriptionsData, setSubscriptionsData, {new: subscription, old: props.subscriptionInfo}, "Update");
          } else {
            updateSubscriptionsData(subscriptionsData, setSubscriptionsData, {new: subscription, old: undefined}, "Insert");
          }

           // clear fields.
           clearValues();
           clearAlerts();
           setChosenCategories([]);
           setCategoriesAvailable([]);
           setShowRequiredAlert(false);
           setShowToastMessage({show: true, text: hasInfo ? "The changes are successfully saved" : "Subscription has been successfully added!"})
           props.setShowAddSubscriptionPrompt(false);
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
      <div className={`${props.classname === "show" && "prompt"}`}>
        <div className={`prompt-box ${props.classname} w-100 d-flex flex-column align-items-center gap-5 p-2 p-lg-4`}>
          <div className="d-flex align-items-center justify-content-between w-100">
            <h2 className="fs-4">{hasInfo ? "Edit" : "Create"} Subscription</h2>
            <div onClick={handleCancel} role="button">
              <HiXMark style={{width: 30, height: 30}}/>
            </div>
          </div>
          <form className="w-100 d-flex flex-column align-items-center gap-4" encType="multipart/form-data">
            <div className="w-100 d-flex flex-column align-items-center">
              <FormInput alert={titleAlert.error || (showRequiredAlert && !title)} classname="w-100 input" required title="Title">
                <input
                  ref={titleRef}
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
                <select 
                  required 
                  value={""} 
                  onChange={(e) => {
                    const val = e.target.value
                    val !== "Add Category" ? handleCategorySelect(val, categoriesAvailable, setCategoriesAvailable, chosenCategories, setChosenCategories)
                    : setShowAddCategoryPrompt(true);
                  }} 
                  className="px-3"
                >
                  <option className="d-none" disabled value={""} />
                  {categoriesAvailable.map((category: string, key: number) => {
                    return <option
                      style={{textOverflow: "ellipsis"}}
                      value={category}
                      key={key}>{getCategoryNameById(categoriesData, category) || category}</option>
                  })}
                  <option value={"Add Category"}>Add Category</option>
                </select>
                <div style={{top: -25}} className="mx-3 align-self-start position-relative d-flex align-items-center flex-wrap gap-2">
                  {
                    chosenCategories.length ? chosenCategories.map((category: string, key: number) => {
                      return <div style={{border: "1px solid var(--border)", backgroundColor: "var(--primary)"}} className="rounded p-2 d-flex align-items-center gap-1 fw-bold" key={key}>
                        <span style={{color: "var(--text)"}}>{getCategoryNameById(categoriesData, category) || category}</span>
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
            <div className="w-100 d-flex flex-column align-items-center position-relative">
              <FormInput alert={amountAlert.error || (showRequiredAlert && !amount)} required classname="w-100 input" title="Amount">
                <span className="position-absolute h-100 d-flex align-items-center ps-2 fw-bold">{currency}</span>
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
              <FormInput alert={startDateAlert.error || endDateAlert.error || (showRequiredAlert && (!startDateString || !endDateString))} required classname="w-100 input" title="Payment Date">
                <DatePicker 
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => {
                    const [curMonth, curDay, curYear] = curDate.split("/"); 
                    const [startMonth, startDay, startYear] = startDateString ? startDateString.split("/") : [undefined, undefined, undefined];
                    const [endMonth, endDay, endYear] = endDateString ? endDateString.split("/") : [undefined, undefined, undefined];

                    setDateRange(update);
                    startDateString && handleDateChangeAlert(curYear, curMonth, curDay, startYear!, startMonth!, startDay!, setStartDateAlert, "More", {moreTypeCustomText: "You could not choose date in the past"});
                    startDateString && endDateString && handleDateChangeAlert(startYear!, startMonth!, startDay!, endYear!, endMonth!, endDay!, setEndDateAlert, "More", {moreTypeCustomText: "You could not choose date earlier than first day of payment"});
                  }}
                  isClearable={true}
                  className="px-3 bg-transparent"
                />
              </FormInput>
              {startDateAlert.error && <span style={{color: "var(--danger)"}} className="w-100 mt-2">{startDateAlert.text}</span>}
              {endDateAlert.error && <span style={{color: "var(--danger)"}} className="w-100 mt-2">{endDateAlert.text}</span>}
              {showRequiredAlert && (!startDateString || !endDateString) && <span className="w-100 mt-2" style={{color: "var(--danger)"}}>Date is required field!</span>}
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
          </form>
          <div className="w-100 mt-auto d-flex justify-content-end gap-3">
            <button onClick={(e) => {e.preventDefault(); setShowCancelPrompt(true);}} className="action-button negative">Cancel</button>
            <button disabled={isButtonDisabled} onClick={(e) => handleSave(e)} className="action-button positive" type="submit">Save</button>
          </div>
        </div>
      </div>
      {showCancelPrompt &&
        <ActionPrompt
          text={hasInfo ? "Are you sure you want to terminate editing?[br]Your changes will not be saved" : "Are you sure you want to cancel creating a[br]Subscription?"}
          confirm={{action: () => handleCancel(), text: "Yes"}}
          cancel={{action: () => setShowCancelPrompt(false), text: "No"}}
          alert
        />
      }
    </>
  );
}

export default AddSubscriptionPrompt;