import "./addCategoryPrompt.css";
import { HiXMark } from "react-icons/hi2";
import { handleTransactionTypeChange } from "../sharedFunctions";
import IndicatorButton from "../../../Components/Home/IndicatorButton/IndicatorButton";
import FormInput from "../../../Components/Home/FormInput/FormInput";
import { useContext, useEffect, useRef, useState } from "react";
import { handleTitleChange } from "../sharedFunctions";
import { categoryExistsByTitle, clearFormStringValues, createCategory, editCategory, updateCategoriesData } from "../../../Functions";
import { AuthContext } from "../../../Contexts/AuthContextProvider";
import { GeneralContext } from "../../../Contexts/GeneralContextProvider";
import ActionPrompt from "../../../Components/Home/ActionPrompt/ActionPrompt";

const AddCategoryPrompt = (props: {
  setShowAddCategoryPrompt: React.Dispatch<React.SetStateAction<boolean>>,
  classname?: string,
  data?: CategoryData
}) => {
  // if it's edit it will have info
  const hasInfo = props.data;
  // data providers
  const {currentUserData, categoriesData, setCategoriesData, transactionsData} = useContext(AuthContext);
  const {setShowToastMessage} = useContext(GeneralContext);
  // title input ref.
  const titleRef = useRef<HTMLInputElement | null>(null);
  // fields.
  const [transactionType, setTransactionType] = useState<string>(hasInfo ? hasInfo.transactionType : "Expenses");
  const [title, setTitle] = useState<string>(hasInfo ? hasInfo.title : "");
  const [titleAlert, setTitleAlert] = useState<InputBasicAlert>({error: false, text: ""});
  // required alert.
  const [showRequiredAlert, setShowRequiredAlert] = useState<boolean>(false);
  // button disable state.
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
  // exists already alert.
  const existsAlready = hasInfo ? 
    hasInfo.title.toLocaleLowerCase() !== title.toLocaleLowerCase() ?
      categoryExistsByTitle(categoriesData, title, transactionType) ? true : false
    :
      false
  : 
    categoryExistsByTitle(categoriesData, title, transactionType) ? true : false;

  // whenever info changes update fields
  useEffect(() => {
    if(hasInfo) {
      setTitle(hasInfo.title);
      setTransactionType(hasInfo.transactionType);
    }
  }, [hasInfo]);

  // detect if button should be disabled or not on title change.
  useEffect(() => {
    // if there is and error and no field is changed, disable the button
    titleAlert.error || 
    showRequiredAlert ||
    existsAlready ||
    (hasInfo && hasInfo.title === title) ? 
      setIsButtonDisabled(true) 
    : 
      setIsButtonDisabled(false);
    // otherwise enable it
  }, [title, transactionType]);

  const clearValues = () => clearFormStringValues(setTitle);
  const clearAlerts = () => {
    setTitleAlert({error: false, text: ""});
    setShowRequiredAlert(false);
  }

  const handleCancel = () => {
    if(!hasInfo) {
      clearValues();
    } else {
      setTitle(hasInfo.title);
    }
    clearAlerts();
    props.setShowAddCategoryPrompt(false);
  };

  const handleSave = async () => {
    if(title) {
      // if title is filled (only field for category)
      const owner = (currentUserData as CurrentUserData)._id;

      try {
        let categoryResponse;

        if(hasInfo) {
          // if it's edit (has info) create edit body
          const rqbody = {infoForEdit: {
            owner: hasInfo.owner,
            categoryId: hasInfo._id,
            fields: {title, transactionType}
          }}

          // send request
          categoryResponse = await editCategory(rqbody);
        } else {
          // otherwise create creation body
          const rqbody = {owner, title, transactionType}
          // send request
          categoryResponse = await createCategory(rqbody);
        }
        
        // update data in state and cache, show successfull toast message, clear values and close prompt
        updateCategoriesData(categoriesData, setCategoriesData, {new: categoryResponse, old: hasInfo}, hasInfo ? "Update" : "Insert");
        setShowToastMessage({show: true, text: hasInfo ? "Updates saved successfully" :  "A category created successfully"});
        clearValues();
        props.setShowAddCategoryPrompt(false);
      } catch (err) {
        console.error(err);
      }
    } else {
      // otherwise set required alert and disable button
      setIsButtonDisabled(true);
      setShowRequiredAlert(true);
    }
  }

  const isCategoryInUse = hasInfo && transactionsData.find((data: TransactionData) => data.chosenCategories.indexOf(hasInfo._id) > -1);

  const [showSavePrompt, setShowSavePrompt] = useState<boolean>(false);

  const proceedSave = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if(!existsAlready && !titleAlert.error){
      // if category does not exist and there is no error
      // if category is in use show prompt (can not delete until in use)
      if(isCategoryInUse) setShowSavePrompt(true);
      // otherwise handle save
      else handleSave();
    }
  }

  return (
    <>
      <div className={`${props.classname === "show" && "prompt"}`}>
        <div className={`prompt-box ${props.classname} w-100 d-flex flex-column align-items-center gap-5 p-2 p-lg-4`}>
          <div className="d-flex align-items-center justify-content-between w-100">
            <h2 className="fs-4">{hasInfo ? "Edit" : "Create"} Category</h2>
            <div onClick={handleCancel} role="button">
              <HiXMark style={{width: 30, height: 30}}/>
            </div>
          </div>
          <form className="w-100 d-flex flex-column align-items-center gap-4">
            <div className="w-100 d-flex align-items-center mb-2">
              <button 
                onClick={!hasInfo ? (e) => handleTransactionTypeChange(e, "Expenses", setTransactionType) : (e) => e.preventDefault()} 
                style={{border: "1px solid var(--border)"}} 
                className={`transaction-type-button ${transactionType === "Expenses" && "active"} rounded bg-transparent py-1 pe-2`} value="Expenses"
              >
                <IndicatorButton classname="bg-transparent" type="Expenses" />
              </button>
              <button 
                onClick={!hasInfo ?  (e) => handleTransactionTypeChange(e, "Income", setTransactionType) : (e) => e.preventDefault()}
                style={{border: "1px solid var(--border)", left: -2}} 
                className={`transaction-type-button ${transactionType === "Income" && "active"} position-relative border-start-0 rounded-end bg-transparent py-1 pe-2`} value="Income"
              >
                <IndicatorButton classname="bg-transparent" type="Income" />
              </button>
            </div>
            <div className="w-100 d-flex flex-column align-items-center">
              <FormInput alert={titleAlert.error || (showRequiredAlert && !title) || existsAlready} classname="w-100 input" required title="Title">
                <input
                  ref={titleRef}
                  value={title}
                  onBlur={() => {if(titleRef.current) titleRef.current.scrollLeft = 0}}
                  onChange={(e) => handleTitleChange(e, setTitle, setTitleAlert, {customAlert: "Please, enter the name that doesn't include any of these characters: «*\\~`!@#$%^&/><+_=|»"})} 
                  required 
                  type="text" 
                  className="px-3" 
                />
              </FormInput>
              {titleAlert.error && <span style={{color: "var(--danger)"}} className="w-100 mt-2">{titleAlert.text}</span>}
              {showRequiredAlert && !title && <span className="w-100 mt-2" style={{color: "var(--danger)"}}>Title is required field!</span>}
              {existsAlready && <span style={{color: "var(--danger)"}} className="w-100 mt-2">A category with the same title already exists. Please update the title</span>}
            </div>
          </form>
          <div className="w-100 mt-auto d-flex justify-content-end gap-3">
            <button onClick={(e) => {e.preventDefault(); handleCancel()}} className="action-button negative">Cancel</button>
            <button disabled={isButtonDisabled} onClick={(e) => proceedSave(e)} className="action-button positive" type="submit">Save</button>
          </div>
        </div>
      </div>
      {showSavePrompt &&
        <ActionPrompt
          head="Category Edit"
          text="This category is already used in income or expenses. Updates will change them. Proceed?"
          cancel={{text: "No", action: () => {handleCancel(); setShowSavePrompt(false)}}}
          confirm={{text: "Yes", action: () => {handleSave(); setShowSavePrompt(false)}}}
        />
      }
    </>
  );
}

export default AddCategoryPrompt;