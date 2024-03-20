import "./addPiggyBankPrompt.css";
import { HiXMark } from "react-icons/hi2";
import FormInput from "../../../Components/Home/FormInput/FormInput";
import { useRef, useState, useEffect, useContext } from "react";
import { handleTitleChange, handleAmountChange } from "../sharedFunctions";
import ActionPrompt from "../../../Components/Home/ActionPrompt/ActionPrompt";
import { divideByThousands, clearFormStringValues, updatePiggyBanksData, editPiggyBank, createPiggyBank } from "../../../Functions";
import { AuthContext } from "../../../Contexts/AuthContextProvider";
import { GeneralContext } from "../../../Contexts/GeneralContextProvider";

const AddPiggyBankPrompt = (props: {
  accountData: AccountData,
  setShowAddPiggyBankPrompt: React.Dispatch<React.SetStateAction<boolean>>,
  piggyBankInfo?: PiggyBankData,
  classname?: string,
}) => {
  const hasInfo = props.piggyBankInfo;
  const currency = props.accountData.currency.split(" ")[1];

  const {piggyBanksData, setPiggyBanksData} = useContext(AuthContext);
  const {setShowToastMessage} = useContext(GeneralContext);

  const goalRef = useRef<HTMLInputElement | null>(null);
  const [goal, setGoal] = useState<string>("");
  const [goalAlert, setGoalAlert] = useState<InputBasicAlert>({error: false, text: ""});

  const [goalAmount, setGoalAmount] = useState<string>("");
  const [goalAmountAlert, setGoalAmountAlert] = useState<InputBasicAlert>({error: false, text: ""});

  const [showRequiredAlert, setShowRequiredAlert] = useState<boolean>(false);

  const [showCancelPrompt, setShowCancelPrompt] = useState<boolean>(false);

  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);

  const mandatoriesFilled = goal && goalAmount ? true : false;

  useEffect(() => {
    hasInfo ? 
      hasInfo.goal.toLowerCase() !== goal.toLowerCase() || hasInfo.goalAmount !== goalAmount ?
        setIsButtonDisabled(false)
      : 
        setIsButtonDisabled(true)
    :
      mandatoriesFilled && setIsButtonDisabled(false);
  }, [goal, goalAmount])

  const initValues = () => {
    if(hasInfo) {
      const {goal, goalAmount} = hasInfo;
      setGoal(goal);
      setGoalAmount(goalAmount);
    }
  }

  // fill info if it's edit
  useEffect(() => {
    initValues();
  }, [hasInfo]);

  const clearValues = () => clearFormStringValues(setGoal, setGoalAmount);
  const clearAlerts = () => {
    setGoalAlert({error: false, text: ""});
    setGoalAmountAlert({error: false, text: ""});
  }

  // cancel button click handler (piggy bank creation).
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
    props.setShowAddPiggyBankPrompt(false);
  }

  const handleSave = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if(mandatoriesFilled) {
      if(!goalAlert.error && !goalAmountAlert.error) {
        try {
          let piggyBank;

          if(hasInfo) {
            const rqbody = {
              belongsToAccountWithId: hasInfo.belongsToAccountWithId, 
              piggyBankId: hasInfo._id,
              fields: {goal, goalAmount}
            }

            piggyBank = await editPiggyBank(rqbody);
          } else {
            const rqbody = {belongsToAccountWithId: props.accountData._id, goal, goalAmount};
            piggyBank = await createPiggyBank(rqbody);
          }

          clearValues();
          clearAlerts();
          setShowRequiredAlert(false);
          if(hasInfo) {
            updatePiggyBanksData(piggyBanksData, setPiggyBanksData, {new: piggyBank, old: hasInfo}, "Update");
          } else {
            updatePiggyBanksData(piggyBanksData, setPiggyBanksData, {new: piggyBank, old: undefined}, "Insert");
          }
          setShowToastMessage({show: true, text: hasInfo ? "Piggy bank edited successfully" : "Piggy bank added successfully!"});
          props.setShowAddPiggyBankPrompt(false);
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
    <>
      <div className={`${props.classname === "show" && "prompt"}`}>
        <div className={`prompt-box ${props.classname} w-100 d-flex flex-column align-items-center gap-5 p-2 p-lg-4`}>
          <div className="d-flex align-items-center justify-content-between w-100">
            <h2 className="fs-4">{hasInfo ? "Edit" : "Create"} Piggy Bank</h2>
            <div onClick={handleCancel} role="button">
              <HiXMark style={{width: 30, height: 30}}/>
            </div>
          </div>
          <form className="w-100 d-flex flex-column align-items-center gap-4" encType="multipart/form-data">
            <div className="w-100 d-flex flex-column align-items-center">
              <FormInput alert={goalAlert.error || (showRequiredAlert && !goal)} classname="w-100 input" required title="Goal">
                <input
                  ref={goalRef}
                  value={goal}
                  onBlur={() => {if(goalRef.current) goalRef.current.scrollLeft = 0}}
                  onChange={(e) => handleTitleChange(e, setGoal, setGoalAlert)} 
                  required 
                  type="text" 
                  className="px-3" 
                />
              </FormInput>
              {goalAlert.error && <span style={{color: "var(--danger)"}} className="w-100 mt-2">{goalAlert.text}</span>}
              {showRequiredAlert && !goal && <span className="w-100 mt-2" style={{color: "var(--danger)"}}>Title is required field!</span>}
            </div>
            <div className="w-100 d-flex flex-column align-items-center position-relative">
              <FormInput alert={goalAmountAlert.error || (showRequiredAlert && !goalAmount)} required classname="w-100 input" title="Amount">
                <span className="position-absolute h-100 d-flex align-items-center ps-2 fw-bold">{currency}</span>
                <input 
                  value={goalAmount}
                  onBlur={() => setGoalAmount(divideByThousands(parseFloat(goalAmount)))}
                  onChange={(e) => handleAmountChange(e, setGoalAmount, setGoalAmountAlert)} 
                  required 
                  type="text"
                  placeholder="0.00"
                  className="px-4" />
              </FormInput>
              {goalAmountAlert.error && <span className="w-100 mt-2" style={{color: "var(--danger)"}}>{goalAmountAlert.text}</span>}
              {showRequiredAlert && !goalAmount && <span className="w-100 mt-2" style={{color: "var(--danger)"}}>Amount is required field!</span>}
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
          text={hasInfo ? "Are you sure you want to terminate editing?[br]Your changes will not be saved" : "Are you sure you want to cancel creating a[br]Piggy Bank?"}
          confirm={{action: () => handleCancel(), text: "Yes"}}
          cancel={{action: () => setShowCancelPrompt(false), text: "No"}}
          alert
        />
      }
    </>
  );
}

export default AddPiggyBankPrompt;