import { getGlobalTimeUnixApi } from "../apiURLs";

export const accountExistsByTitle = (accArr: AccountData[], title: string) => {
  const foundAcc = accArr.find(acc => acc.title.toLocaleLowerCase() === title.toLocaleLowerCase());
  return foundAcc;
}

export const makeFirstCapitals = (str: string) => {
  const returnWords = [];
  const splitStr = str.trim().split(" ");
  
  for(let word of splitStr) {
    let firstUpNextLow = word.toLocaleLowerCase().split("");
    firstUpNextLow[0] = firstUpNextLow[0].toLocaleUpperCase();
    returnWords.push(firstUpNextLow.join(""));
  }

  return returnWords.join(" ");
}

// Function to get global unix time and not system time.
export const getGlobalTimeUnix = async () => {
  // Helper function that fetches data.
  const getGlobalTimeHelper = async () => {
    const globalTime: any = (await fetch(getGlobalTimeUnixApi)).json();
    return globalTime;
  }

  const time = await getGlobalTimeHelper();
  return new Date(time.utc_datetime).getTime();
}

// function that divides number by thousands
export const divideByThousands = (val: number) => {
  const splitValue = val.toFixed(2).toString().split(".");
  // left side digits of float number (divided by comma after every 3 digit).
  const dividedByThousandDecimalPart = splitValue[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  // if float part exists (right side of dot) then get it.
  const floatPart = splitValue[1];
  // concatenate everything.
  return floatPart ? `${dividedByThousandDecimalPart}.${floatPart}` : dividedByThousandDecimalPart;
}

export const removeThousandsCommas = (val: string) => {
  return parseFloat(val.replace(/,/g, ""));
}

// update accounts data in cache and update state
export const updateAccountsData = (currentData: AccountData[], setData: React.Dispatch<React.SetStateAction<AccountData[] | []>>, data: {new: AccountData, old: AccountData | undefined}, type: "Insert" | "Update" | "Delete") => {
  const newAccountsData = [...currentData];
  if(type === "Insert") {
    newAccountsData.push(data.new);
  } else if (type === "Update") {
    newAccountsData[newAccountsData.indexOf(data.old!)] = data.new;
  } else if (type === "Delete") {
    newAccountsData.slice(newAccountsData.indexOf(data.new), 1); 
  }

  window.sessionStorage.setItem("Budgetify-user-accounts-data", JSON.stringify(newAccountsData));
  setData(newAccountsData);
}

// update transactions data in cache and update state
export const updateTransactionsData = (currentData: TransactionData[], setData: React.Dispatch<React.SetStateAction<[] | TransactionData[]>>, data: {new: TransactionData, old: TransactionData | undefined}, type: "Insert" | "Update" | "Delete") => {
  const newTransactionsData = [...currentData];
  if(type === "Insert") {
    newTransactionsData.push(data.new);
  } else if (type === "Update") {
    newTransactionsData[newTransactionsData.indexOf(data.old!)] = data.new;
  } else if (type === "Delete") {
    newTransactionsData.slice(newTransactionsData.indexOf(data.new), 1); 
  }

  window.sessionStorage.setItem("Budgetify-user-transactions-data", JSON.stringify(newTransactionsData));
  setData(newTransactionsData);
}

export const clearFormStringValues = (...valueSetters: React.SetStateAction<any>) => {
  for(let setValue of valueSetters) {
    setValue("");
  }
}