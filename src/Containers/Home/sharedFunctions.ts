import { ChangeEvent } from "react";

// title onchange handler
export const handleTitleChange = (
  e: ChangeEvent<HTMLInputElement>, 
  setTitle: React.Dispatch<React.SetStateAction<string>>, 
  setAlert: React.Dispatch<React.SetStateAction<{
    error: boolean;
    text: string;
  }>>,
  options?: {
    customAlert: string
  }
) => {
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
  setAlert({
    error: maxCharErr || charErr,
    text: maxCharErr ? "Maximum number of characters reached." :
          charErr ?
            options ? options.customAlert : "Invalid Title entered. Please check it." : ""
  });
}

// description onchange handler
export const handleDescriptionChange = (
  e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  setDescription: React.Dispatch<React.SetStateAction<string>>,
  setAlert: React.Dispatch<React.SetStateAction<{
    error: boolean;
    text: string;
  }>>
) => {
  // Prevent default behavior.
  e.preventDefault();
  const value = e.target.value;
  // Update description state.
  setDescription(value);
  // Check if characters exceed 256.
  const maxCharErr = value.length > 256;

  // Update alert.
  setAlert({
      error: maxCharErr, 
      text: maxCharErr ? "Maximum number of characters reached." : ""
  });
}

// amount onChange handler.
export const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>, setAmount: React.Dispatch<React.SetStateAction<string>>, setAmountAlert: React.Dispatch<React.SetStateAction<InputBasicAlert>>) => {
  event.preventDefault();
  // pattern that amount must match.
  const pattern = "^\\d+(?:\\.\\d{1,2})?$";
  const value = event.target.value.replace(/,/g, '');
  // update amount state with current value.
  setAmount(value);
  // if value matches pattern.
  if(value.match(pattern)) {
    // if value is parseable in float and is less than 0, update amount alert. otherwise clear it.
    parseFloat(value) <= 0 ? setAmountAlert({error: true, text: "You should enter a positive amount!"})
    : setAmountAlert({error: false, text: ""});
  } else {
    // if value is not parseable in float, update alert.
    setAmountAlert({error: true, text: "Invalid amount entered"});
  }
}

// transaction onChange handler
export const handleTransactionTypeChange = (event: React.MouseEvent<HTMLButtonElement>, value: string, setType: React.Dispatch<React.SetStateAction<string>>, cb?: () => any) => {
  event.preventDefault();
  setType(value);
  cb && cb();
}

// date change alert handler
export const handleDateChangeAlert = (
  curYear: string, 
  curMonth: string, 
  curDay: string, 
  year: string, 
  month: string, 
  day: string, 
  setDateAlert: React.Dispatch<React.SetStateAction<InputBasicAlert>>, 
  type: "More" | "Less",
  options?: {
    moreTypeCustomText?: string,
    lessTypeCustomText?: string
  }
) => {
  const alertText = type === "Less" ? 
    options && options.lessTypeCustomText ? options.lessTypeCustomText : "Invalid date entered"
  :
    options && options.moreTypeCustomText ? options.moreTypeCustomText : "Invalid date entered"

  if(type === "Less" ? parseInt(year) > parseInt(curYear) : parseInt(year) < parseInt(curYear)) {
    // if input year is more than current year update date alert.
    setDateAlert({error: true, text: alertText});
  } else if (parseInt(year) === parseInt(curYear)) {
    // if years are same and later month is entered than the current one, or months are also same
    // and later day is entered than the current one, update date alert.
    if(type === "Less" ? parseInt(month) > parseInt(curMonth) || (parseInt(month) === parseInt(curMonth) && parseInt(day) > parseInt(curDay))
    : parseInt(month) < parseInt(curMonth) || (parseInt(month) === parseInt(curMonth) && parseInt(day) < parseInt(curDay))) {
      setDateAlert({error: true, text: alertText});
    } else {
      setDateAlert({error: false, text: ""});
    }
  } else {
    // otherwise clear alert
    setDateAlert({error: false, text: ""});
  }
}

// date onChange handler.
export const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>, curDate: string, setDate: React.Dispatch<React.SetStateAction<string>>, setDateAlert?: React.Dispatch<React.SetStateAction<InputBasicAlert>>) => {
  event.preventDefault();
  const value = event.target.value;
  // update date with current value.
  setDate(value);
  // get year, month and day from value. (initial format is: yy-mm-dd)
  const [year, month, day] = value.split("-");
  // get current year, month and day value. (initial format is: mm-dd-yy)
  const [curMonth, curDay, curYear] = curDate.split("/");
  
  if(setDateAlert) {
    handleDateChangeAlert(curYear, curMonth, curDay, year, month, day, setDateAlert, "Less");
  }
}

// category onClick handler.
export const handleCategorySelect = (value: string, categoriesAvailable: string[], setCategoriesAvailable: React.Dispatch<React.SetStateAction<string[]>>, chosenCategories?: string[], setChosenCategories?: React.Dispatch<React.SetStateAction<string[]>>) => {
  // get current categories.
  const renewedCategories = [...categoriesAvailable];
  // remove category (which was chosen) from current categories.
  renewedCategories.splice(renewedCategories.indexOf(value), 1);
  // update state.
  setCategoriesAvailable(renewedCategories);
  if(chosenCategories && setChosenCategories) {
    // get chosen categories.
    const renewedChosenCategories = [...chosenCategories];
    // add category in chosen categories.
    renewedChosenCategories.push(value);
    // update state.
    setChosenCategories(renewedChosenCategories);
  }
}

// category (X button click) unselect handler.
export const handleCategoryUnselect = (value: string, categoriesAvailable: string[], setCategoriesAvailable: React.Dispatch<React.SetStateAction<string[]>>, chosenCategories?: string[], setChosenCategories?: React.Dispatch<React.SetStateAction<string[]>>) => {
  // get current categories data that are not chosen yet.
  const renewedCategories = [...categoriesAvailable];
  // add category which was removed.
  renewedCategories.push(value);
  // update state.
  setCategoriesAvailable(renewedCategories);
  if(chosenCategories && setChosenCategories) {
    // get currently chosen categories.
    const renewedChosenCategories = [...chosenCategories];
    // remove category (which was removed) from chosen categories.
    renewedChosenCategories.splice(renewedChosenCategories.indexOf(value), 1);
    // update state.
    setChosenCategories(renewedChosenCategories);
  }
}

// handle files change
export const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>, currentData: TransactionFilesData[], setData: React.Dispatch<React.SetStateAction<TransactionFilesData[]>>, setAlert: React.Dispatch<React.SetStateAction<InputBasicAlert>>) => {
  // at first val won't have "_id" key and "path" key since they are not yet pushed on the server.
  const val = event.target.files && event.target.files[0] as unknown as TransactionFilesData;
  const foundAttachment = val && currentData.find((attach: TransactionFilesData) => attach.name === val.name && attach.size === val.size && attach.type === val.type);

  const totalSize = val && [val, ...currentData].reduce((size: number, data: TransactionFilesData) => {
    return size += data.size;
  }, 0);

  const totalSizeInMbs = totalSize && parseFloat((totalSize / 1024 / 1024).toFixed(2));
  if(totalSizeInMbs && totalSizeInMbs > 5) {
    setAlert({error: true, text: "Size of attachments exceeds 5mb!"})
  } 

  setData(prev => {
    return val && !foundAttachment ? [val, ...prev] : prev
  });
  if(!foundAttachment && currentData.length >= 5) {
    setAlert({error: true, text: "The Number is more than 5 units. Please check it"});
  } 
 }

// handle added files removal
export const handleFileRemove = (file: TransactionFilesData, currentData: TransactionFilesData[], setData: React.Dispatch<React.SetStateAction<TransactionFilesData[]>>, setAlert: React.Dispatch<React.SetStateAction<InputBasicAlert>>) => {
  const newFileData = currentData.slice();
  newFileData.splice(currentData.indexOf(file), 1);
  setData(newFileData);

  const totalSize = newFileData.reduce((size: number, data: TransactionFilesData) => {
    return size += data.size;
  }, 0);
  
  const totalSizeInMbs = totalSize && parseFloat((totalSize / 1024 / 1024).toFixed(2));

  if(totalSizeInMbs && totalSizeInMbs <= 10 && newFileData.length <= 5) {
    setAlert({error: false, text: ""});
  } else if (totalSizeInMbs && totalSizeInMbs > 10) {
    setAlert({error: true, text: "Size of attachments exceeds 10mb!"});
  } else if (newFileData.length > 5) {
    setAlert({error: true, text: "The Number is more than 5 units. Please check it"});
  }
}