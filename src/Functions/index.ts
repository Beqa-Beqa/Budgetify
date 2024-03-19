import { 
  deleteAccountApi, deletePiggyBankApi, getGlobalTimeUnixApi, 
  deleteCategoryApi, createCategoryApi, editAccountApi, createTransactionApi
} from "../apiURLs";

export const accountExistsByTitle = (accArr: AccountData[], title: string) => {
  const foundAcc = accArr.find(acc => acc.title.toLocaleLowerCase() === title.toLocaleLowerCase());
  return foundAcc;
}

export const categoryExistsByTitle = (categArr: CategoryData[], title: string, transactionType: string) => {
  const foundCateg = categArr.find(categ => categ.title.toLocaleLowerCase() === title.toLocaleLowerCase() && categ.transactionType === transactionType);
  return foundCateg;
}

export const subscriptionExistsByTitle = (subscArr: SubscriptionData[], title: string) => {
  return subscArr.find(data => data.title.toLocaleLowerCase() === title.toLocaleLowerCase());
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
export const updateAccountsData = (currentData: AccountData[], setData: React.Dispatch<React.SetStateAction<AccountData[]>>, data: {new: AccountData, old: AccountData | undefined}, type: "Insert" | "Update" | "Delete") => {
  const newAccountsData = [...currentData];
  if(type === "Insert") {
    newAccountsData.push(data.new);
  } else if (type === "Update") {
    newAccountsData[newAccountsData.indexOf(data.old!)] = data.new;
  } else if (type === "Delete") {
    newAccountsData.splice(newAccountsData.indexOf(data.new), 1); 
  }

  window.sessionStorage.setItem("Budgetify-user-accounts-data", JSON.stringify(newAccountsData));
  setData(newAccountsData);
}

// update transactions data in cache and update state
export const updateTransactionsData = (currentData: TransactionData[], setData: React.Dispatch<React.SetStateAction<TransactionData[]>>, data: {new: TransactionData, old: TransactionData | undefined}, type: "Insert" | "Update" | "Delete") => {
  const newTransactionsData = [...currentData];
  if(type === "Insert") {
    newTransactionsData.push(data.new);
  } else if (type === "Update") {
    newTransactionsData[newTransactionsData.indexOf(data.old!)] = data.new;
  } else if (type === "Delete") {
    newTransactionsData.splice(newTransactionsData.indexOf(data.new), 1); 
  }

  window.sessionStorage.setItem("Budgetify-user-transactions-data", JSON.stringify(newTransactionsData));
  setData(newTransactionsData);
}

// update subscriptions data in cache and update state
export const updateSubscriptionsData = (currentData: SubscriptionData[], setData: React.Dispatch<React.SetStateAction<SubscriptionData[]>>, data: {new: SubscriptionData, old: SubscriptionData | undefined}, type: "Insert" | "Update" | "Delete") => {
  const newSubscriptionsData = [...currentData];
  if(type === "Insert") {
    newSubscriptionsData.push(data.new);
  } else if (type === "Update") {
    newSubscriptionsData[newSubscriptionsData.indexOf(data.old!)] = data.new;
  } else if (type === "Delete") {
    newSubscriptionsData.splice(newSubscriptionsData.indexOf(data.new), 1);
  }

  window.sessionStorage.setItem("Budgetify-user-subscriptions-data", JSON.stringify(newSubscriptionsData));
  setData(newSubscriptionsData);
}

// update piggy banks data in cache and update state
export const updatePiggyBanksData = (currentData: PiggyBankData[], setData: React.Dispatch<React.SetStateAction<PiggyBankData[]>>, data: {new: PiggyBankData, old: PiggyBankData | undefined}, type: "Insert" | "Update" | "Delete") => {
  const newPiggyBanksData = [...currentData];
  if(type === "Insert") {
    newPiggyBanksData.push(data.new);
  } else if (type === "Update") {
    newPiggyBanksData[newPiggyBanksData.indexOf(data.old!)] = data.new;
  } else if (type === "Delete") {
    newPiggyBanksData.splice(newPiggyBanksData.indexOf(data.new), 1);
  }

  window.sessionStorage.setItem("Budgetify-user-piggy-banks-data", JSON.stringify(newPiggyBanksData));
  setData(newPiggyBanksData);
}

// update categories data in cache and update state
export const updateCategoriesData = (currentData: CategoryData[], setData: React.Dispatch<React.SetStateAction<CategoryData[]>>, data: {new: CategoryData, old: CategoryData | undefined}, type: "Insert" | "Update" | "Delete") => {
  const newCategoriesData = [...currentData];
  if(type === "Insert") {
    newCategoriesData.push(data.new);
  } else if (type === "Update") {
    newCategoriesData[newCategoriesData.indexOf(data.old!)] = data.new;
  } else if (type === "Delete") {
    newCategoriesData.splice(newCategoriesData.indexOf(data.new), 1);
  }

  window.sessionStorage.setItem("Budgetify-user-categories-data", JSON.stringify(newCategoriesData));
  setData(newCategoriesData);
}

export const clearFormStringValues = (...valueSetters: React.SetStateAction<any>) => {
  for(let setValue of valueSetters) {
    setValue("");
  }
}

// sorts given array of object by specified key value (must be a string)
export const sortArrOfObjectByKey = (key: string, srcObjArr: any[]) => {
  const newArr: any[] = [];
  const valuesArr: string[] = [];
  srcObjArr.forEach((obj: any) => valuesArr.push(obj[key].toUpperCase()));
  for(let value of valuesArr.sort()) {
    const elem = srcObjArr.find((obj: any) => obj[key].toUpperCase() === value && newArr.indexOf(obj) === -1);
    newArr.push(elem);
  }
  return newArr;
}

export const getCategoryNameById = (categoriesData: CategoryData[], id: string) => {
  return categoriesData.find((data: CategoryData) => data._id === id)?.title;
}

// API call handlers

export const createCategory = async (fields: {owner: string, transactionType: string, title: string}) => {
  const body = JSON.stringify(fields);
  const category = await fetch(createCategoryApi, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json"
    },
    body
  });

  return await category.json();
}

export const deleteCategory = async (fields: {owner: string, categoryId: string}) => {
  const body = JSON.stringify(fields);
  await fetch(deleteCategoryApi, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json"
    },
    body
  });
}

export const editAccount = async (fields: {infoForEdit: {accId: string, fields: {
  owner?: string,
  title?: string,
  currency?: string,
  amount?: string,
  description?: string,
}}}) => {
  const body = JSON.stringify(fields);
  const account = await fetch(editAccountApi, {
    method: "PATCH",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json"
    },
    body
  });

  return await account.json();
}

export const deleteAccount = async (fields: {accId: string, userId: string}) => {
  const body = JSON.stringify(fields);
  await fetch(deleteAccountApi, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json"
    },
    body
  });
}

export const deletePiggyBank = async (fields: {belongsToAccountWithId: string, piggyBankId: string}) => {
  const body = JSON.stringify(fields);
  await fetch(deletePiggyBankApi, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json"
    },
    body
  });
}

export const createTransaction = async (fields: {
  id: string,
  belongsToAccountWithId: string,
  transactionType: string,
  title: string,
  amount: string,
  date: string,
  payee: string,
  chosenCategories: string[],
  creationDate: string,
  updateDate: string,
  description: string,
}) => {
  const body = JSON.stringify(fields);
  const transaction = await fetch(createTransactionApi, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json"
    },
    body
  });

  return await transaction.json();
}