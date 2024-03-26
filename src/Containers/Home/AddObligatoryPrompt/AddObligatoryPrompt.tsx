import "./addObligatoryPrompt.css";
import { HiXMark } from "react-icons/hi2";
import FormInput from "../../../Components/Home/FormInput/FormInput";
import { useRef, useState, useEffect, useContext } from "react";
import { handleTitleChange, handleAmountChange, handleDateChangeAlert, handleDescriptionChange } from "../sharedFunctions";
import { clearFormStringValues, createObligatory, divideByThousands, editObligatory, getGlobalTimeUnix, obligatoryExistsByTitle, updateObligatoriesData } from "../../../Functions";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ActionPrompt from "../../../Components/Home/ActionPrompt/ActionPrompt";
import { AuthContext } from "../../../Contexts/AuthContextProvider";
import { GeneralContext } from "../../../Contexts/GeneralContextProvider";

const AddObligatoryPrompt = (props: {
  accountData: AccountData,
  setShowAddObligatoryPrompt: React.Dispatch<React.SetStateAction<boolean>>,
  classname?: string,
  obligatoryData?: ObligatoryData
}) => {
  // General info
  const hasInfo = props.obligatoryData;
  const currency = props.accountData.currency.split(" ")[1];

  // title input ref
  const titleRef = useRef<HTMLInputElement | null>(null);

  // context data
  const {obligatoriesData, setObligatoriesData} = useContext(AuthContext);
  const {setShowToastMessage} = useContext(GeneralContext);

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

  // Title
  const [title, setTitle] = useState<string>("");
  const [titleAlert, setTitleAlert] = useState<InputBasicAlert>({error: false, text: ""});

  // amount
  const [amount, setAmount] = useState<string>("");
  const [amountAlert, setAmountAlert] = useState<InputBasicAlert>({error: false, text: ""});

  // date data.
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [startDateString, endDateString] = dateRange.map((date: Date | null) => date && new Date(date).toLocaleString().split(",")[0]);
  const [startDateAlert, setStartDateAlert] = useState<InputBasicAlert>({error: false, text: ""});
  const [endDateAlert, setEndDateAlert] = useState<InputBasicAlert>({error: false, text: ""});

  // description
  const [description, setDescription] = useState<string>("");
  const [descriptionAlert, setDescriptionAlert] = useState<InputBasicAlert>({error: false, text: ""});

  // required alert (empty fields)
  const [showRequiredAlert, setShowRequiredAlert] = useState<boolean>(false);

  // is button disabled or not state
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);

  // cancel prompt state
  const [showCancelPrompt, setShowCancelPrompt] = useState<boolean>(false);

  // if it's edit - input values initialization function
  const initValues = () => {
    if(hasInfo) {
      const {title, amount, dateRange, description} = hasInfo;
      setTitle(title);
      setDateRange(dateRange);
      amount && setAmount(amount);
      description && setDescription(description);
    }
  }

  // fill info if it's edit
  useEffect(() => {
    initValues();
  }, [hasInfo]);

  const clearValues = () => {
    clearFormStringValues(setTitle, setAmount, setDescription);
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
    props.setShowAddObligatoryPrompt(false);
  }

  const mandatoriesFilled = title && startDateString && endDateString && true || false;

  useEffect(() => {
    // if at least one field is changed enable button (edit)
    hasInfo ? 
      (hasInfo.amount !== amount || hasInfo.description !== description || 
      hasInfo.title !== title || hasInfo.startDate !== startDateString || 
      hasInfo.endDate !== endDateString) 
        ?
          setIsButtonDisabled(false) 
        : 
          setIsButtonDisabled(true)
      :
        mandatoriesFilled && setIsButtonDisabled(false);
      // otherwise if mandatories are filled enable button

      !hasInfo && obligatoryExistsByTitle(obligatoriesData, title) && setTitleAlert({error: true, text: "You already have an obligatory with this title"});
      // if obligatory exists with the same title, show error.
  }, [title, description, amount, dateRange])

  const handleSave = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if(mandatoriesFilled) {
      if(!titleAlert.error && !startDateAlert.error && !endDateAlert.error) {
        // if mandatories are filled and no error is present
        try {
          if(hasInfo) {
            // obligatory request body
            const rqbody = {
              obligatoryId: hasInfo._id,
              belongsToAccountWithId: hasInfo.belongsToAccountWithId,
              fields: {
                title, description, amount, dateRange, 
                startDate: startDateString!, 
                endDate: endDateString!
              }
            };
            
            // make obligatory edit request and update data in state and cache
            const editedObligatory = await editObligatory(rqbody);
            updateObligatoriesData(obligatoriesData, setObligatoriesData, {new: editedObligatory, old: hasInfo}, "Update");
          } else {
            // obligatory request body
            const rqbody = {
              belongsToAccountWithId: props.accountData._id,
              title, description, amount, dateRange, 
              startDate: startDateString!, 
              endDate: endDateString!
            };

            // create obligatory and update data in state and cache
            const createdObligatory = await createObligatory(rqbody);
            updateObligatoriesData(obligatoriesData, setObligatoriesData, {new: createdObligatory, old: undefined}, "Insert");
          }
          
          // clear values and alerts and close add obligatory prompt
          // show successfull toast message.
          clearValues();
          clearAlerts();
          setShowRequiredAlert(false);
          props.setShowAddObligatoryPrompt(false);
          setShowToastMessage({show: true, text: hasInfo ? "Obligatory edited successfully" : "Obligatory created successfully"});
        } catch (err) {
          console.error(err);
        }
      }
    } else {
      // otherwise disable button and disable button
      setIsButtonDisabled(true);
      setShowRequiredAlert(true);
    }
  }

  return (
    <>
      <div className={`${props.classname === "show" && "prompt"}`}>
        <div className={`prompt-box ${props.classname} w-100 d-flex flex-column align-items-center gap-5 p-2 p-lg-4`}>
          <div className="d-flex align-items-center justify-content-between w-100">
            <h2 className="fs-4">{hasInfo ? "Edit" : "Create"} Obligatory</h2>
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
            <div className="w-100 d-flex flex-column align-items-center position-relative">
              <FormInput alert={amountAlert.error || (showRequiredAlert && !amount)} classname="w-100 input" title="Amount">
                <span className="position-absolute h-100 d-flex align-items-center ps-2 fw-bold">{currency}</span>
                <input 
                  value={amount}
                  onBlur={() => setAmount(divideByThousands(parseFloat(amount)))}
                  onChange={(e) => handleAmountChange(e, setAmount, setAmountAlert)} 
                  type="text" 
                  className="px-4" />
              </FormInput>
              {amountAlert.error && <span className="w-100 mt-2" style={{color: "var(--danger)"}}>{amountAlert.text}</span>}
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
          text={hasInfo ? "Are you sure you want to terminate editing?[br]Your changes will not be saved" : "Are you sure you want to cancel creating an[br]Obligatory?"}
          confirm={{action: () => handleCancel(), text: "Yes"}}
          cancel={{action: () => setShowCancelPrompt(false), text: "No"}}
          alert
        />
      }
    </>
  );
}

export default AddObligatoryPrompt