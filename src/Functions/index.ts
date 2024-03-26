import { 
  deleteAccountApi, deletePiggyBankApi, getGlobalTimeUnixApi, 
  deleteCategoryApi, createCategoryApi, editAccountApi, createTransactionApi,
  deleteSubscriptionApi, deleteTransactionApi, createAccountApi,
  editCategoryApi, createPiggyBankApi, editPiggyBankApi, createSubscriptionApi,
  editSubscriptionApi, editTransactionApi, createObligatoryApi, editObligatoryApi, deleteObligatoryApi
} from "../apiURLs";

/**
 * 
 * @param accArr (where you want to search)
 * @param title 
 * @returns AccountData object found with that title if exists, if not => undefined
 */
export const accountExistsByTitle = (accArr: AccountData[], title: string) => {
  const foundAcc = accArr.find(acc => acc.title.toLocaleLowerCase() === title.toLocaleLowerCase());
  return foundAcc;
}

/**
 * 
 * @param categArr (where you want to search)
 * @param title 
 * @param transactionType 
 * @returns Category (if exists by title in given transactionType) or undefined (if does not exist)
 */
export const categoryExistsByTitle = (categArr: CategoryData[], title: string, transactionType: string) => {
  const foundCateg = categArr.find(categ => categ.title.toLocaleLowerCase() === title.toLocaleLowerCase() && categ.transactionType === transactionType);
  return foundCateg;
}

/**
 * 
 * @param subscArr (where you want to search)
 * @param title 
 * @returns Subscription (if exists by title) or undefined (if does not exist)
 */
export const subscriptionExistsByTitle = (subscArr: SubscriptionData[], title: string) => {
  return subscArr.find(data => data.title.toLocaleLowerCase() === title.toLocaleLowerCase());
}

/**
 * 
 * @param obligArr (where you want to search)
 * @param title 
 * @returns Obligatory (if exists by title) or undefined (if does not exist)
 */
export const obligatoryExistsByTitle = (obligArr: ObligatoryData[], title: string) => {
  return obligArr.find(data => data.title.toLocaleLowerCase() === title.toLocaleLowerCase());
}

/**
 * 
 * @param str (sentence)
 * @returns sentence with capitalized first letters
 */
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

/**
 * 
 * @returns Global time in unix
 */
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

/**
 * 
 * @param val integer or float
 * @returns string with divided by thousands (inserting comma) and separated fraction part (period)
 */
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

/**
 * 
 * @param val string with inserted commas (seperated by thousands) and periods (seperated by fraction)
 * @returns float 
 */
export const removeThousandsCommas = (val: string) => {
  return parseFloat(val.replace(/,/g, ""));
}

/**
 * 
 * @param currentData Array of accounts data where you want to update
 * @param setData react setstate for accounts data array
 * @param data {new: new data || updated data || data to delete, old: undefined || data which is replaced by updated one (update)}
 * @param type operation type "Insert" | "Update" | "Delete"
 */
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

/**
 * 
 * @param currentData Transactions data array where you want to update
 * @param setData react setstate for transactions data array
 * @param data {new: new data || updated data || data to delete, old: undefined || data which is replaced by updated one (update)}
 * @param type operation type "Insert" | "Update" | "Delete"
 */
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

/**
 * 
 * @param currentData Subscriptions data array where you want to update
 * @param setData react setstate for Subscriptions data array
 * @param data {new: new data || updated data || data to delete, old: undefined || data which is replaced by updated one (update)}
 * @param type operation type "Insert" | "Update" | "Delete"
 */
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

/**
 * 
 * @param currentData Piggy banks data array where you want to update
 * @param setData react setstate for Piggy banks data array
 * @param data {new: new data || updated data || data to delete, old: undefined || data which is replaced by updated one (update)}
 * @param type operation type "Insert" | "Update" | "Delete"
 */
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

/**
 * 
 * @param currentData Categories data array where you want to update
 * @param setData react setstate for Categories data array
 * @param data {new: new data || updated data || data to delete, old: undefined || data which is replaced by updated one (update)}
 * @param type operation type "Insert" | "Update" | "Delete"
 */
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

/**
 * 
 * @param currentData Obligatories data array where you want to update
 * @param setData react setstate for Obligatories data array
 * @param data {new: new data || updated data || data to delete, old: undefined || data which is replaced by updated one (update)}
 * @param type operation type "Insert" | "Update" | "Delete"
 */
export const updateObligatoriesData = (currentData: ObligatoryData[], setData: React.Dispatch<React.SetStateAction<ObligatoryData[]>>, data: {new: ObligatoryData, old: ObligatoryData | undefined}, type: "Insert" | "Update" | "Delete") => {
  const newObligatoriesData = [...currentData];
  if(type === "Insert") {
    newObligatoriesData.push(data.new);
  } else if (type === "Update") {
    newObligatoriesData[newObligatoriesData.indexOf(data.old!)] = data.new;
  } else if (type === "Delete") {
    newObligatoriesData.splice(newObligatoriesData.indexOf(data.new), 1);
  }

  window.sessionStorage.setItem("Budgetify-user-obligatories-data", JSON.stringify(newObligatoriesData));
  setData(newObligatoriesData);
}

/**
 * 
 * @param valueSetters react state setters of string values
 */
export const clearFormStringValues = (...valueSetters: React.SetStateAction<any>) => {
  for(let setValue of valueSetters) {
    setValue("");
  }
}

/**
 * 
 * @param key Value key of which objects should be sorted
 * @param srcObjArr Objects array which is supposed to be sorted
 * @returns Sorted objects array by given key's value
 */
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

/**
 * 
 * @param categoriesData Catgories data array from which name should be taken
 * @param id Id of Custom created category
 * @returns Category title or undefined if not found
 */
export const getCategoryNameById = (categoriesData: CategoryData[], id: string) => {
  return categoriesData.find((data: CategoryData) => data._id === id)?.title;
}

// API call handlers

/**
 * 
 * @param fields Fields which are required for account creation
 * @returns created account in db
 */
// accounts
export const addAccount = async (fields: {
  userId: string, 
  accountData: {
    title: string,
    currency: string,
    amount: string,
    description: string,
  }
}
) => {
const body = JSON.stringify(fields);
const account = await fetch(createAccountApi, {
  method: "POST",
  mode: "cors",
  cache: "no-cache",
  headers: {
    "Content-type": "application/json"
  },
  body
});

return await account.json();
}

/**
 * 
 * @param fields fields which are used for account edit
 * @returns edited account in db
 */
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

/**
 * 
 * @param fields fields neccessary for account delete
 */
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



// transactions
/**
 * 
 * @param fields fields needed for transaction creation
 * @returns created transaction in db
 */
export const createTransaction = async (fields: {
  id: string,
  belongsToAccountWithId: string,
  transactionType: string,
  title: string,
  amount: string,
  date: string,
  payee: string,
  chosenCategories: string[],
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

/**
 * 
 * @param fields fields
 * @returns edited transaction in db
 */
export const editTransaction = async (fields: {
  transactionId: string,
  belongsToId: string,
  fields: {
    transactionType?: string,
    title?: string,
    amount?: string,
    date?: string,
    payee?: string,
    chosenCategories?: string[],
    description?: string,
    files?: TransactionFilesData[]
  }
}) => {
  const body = JSON.stringify(fields);
  const transaction = await fetch(editTransactionApi, {
    method: "PATCH",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json"
    },
    body
  });

  return await transaction.json();
}

/**
 * 
 * @param fields neccessary fields for transaction delete
 */
export const deleteTransaction = async (fields: {transactionId: string, belongsToId: string}) => {
  const body = JSON.stringify(fields);
  await fetch(deleteTransactionApi, {
    method: "POST",
    cache: "no-cache",
    mode: "cors",
    headers: {
      "Content-Type": "application/json"
    },
    body
  });
}



// categories
/**
 * 
 * @param fields fields for category creation
 * @returns created transaction in db
 */
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

/**
 * 
 * @param fields fields needed for category edit
 * @returns edited category in db
 */
export const editCategory = async (fields: {
  infoForEdit: {
    owner: string,
    categoryId: string,
    fields: {
      title?: string,
      transactionType?: string
    }
  }
}) => {
  const body = JSON.stringify(fields);
  const category = await fetch(editCategoryApi, {
    method: "PATCH",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json"
    },
    body
  });

  return await category.json();
}

/**
 * 
 * @param fields fields for category delete
 */
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



// subscriptions
/**
 * 
 * @param fields fields for subscription creation
 * @returns created subscription in db
 */
export const createSubscription = async (fields: {
  belongsToAccountWithId: string,
  title: string,
  description: string,
  amount: string,
  dateRange: [Date | null, Date | null],
  startDate: string | null,
  endDate: string | null,
  chosenCategories: string[]
}) => {
  const body = JSON.stringify(fields);
  const subscription = await fetch(createSubscriptionApi, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json"
    },
    body
  });

  return await subscription.json();
}

/**
 * 
 * @param fields fields for subscription edit
 * @returns edited subscription in db
 */
export const editSubscription = async (fields: {
  subscriptionId: string,
  belongsToAccountWithId: string,
  fields: {
    year?: number,
    months?: number[],
    belongsToAccountWithId?: string,
    title?: string,
    chosenCategories?: string[],
    amount?: string,
    dateRange?: [Date | null, Date | null],
    startDate?: string | null,
    endDate?: string | null,
    description?: string
  }
}) => {
  const body = JSON.stringify(fields);
  const subscription = await fetch(editSubscriptionApi, {
    method: "PATCH",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json"
    },
    body
  });

  return await subscription.json();
}

/**
 * 
 * @param fields fields for subscription delete
 */
export const deleteSubscription = async (fields: {subscriptionId: string, belongsToAccountWithId: string}) => {
  const body = JSON.stringify(fields);
  await fetch(deleteSubscriptionApi, {
    method: "POST",
    cache: "no-cache",
    mode: "cors",
    headers: {
      "Content-Type": "application/json"
    },
    body
  });
}



// piggy banks
/**
 * 
 * @param fields fields for piggy bank creation
 * @returns created piggy bank in db
 */
export const createPiggyBank = async (fields: {belongsToAccountWithId: string, goal: string, goalAmount: string}) => {
  const body = JSON.stringify(fields);
  const piggyBank = await fetch(createPiggyBankApi, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json"
    },
    body
  })

  return await piggyBank.json();
}

/**
 * 
 * @param fields fields for piggy bank edit
 * @returns edited piggy bank in db
 */
export const editPiggyBank = async (fields: {
  belongsToAccountWithId: string,
  piggyBankId: string,
  fields: {
    goal?: string,
    goalAmount?: string,
    currentAmount?: string,
    payments?: {amount: string, date: string}[] 
  }
}) => {
  const body = JSON.stringify(fields);
  const piggyBank = await fetch(editPiggyBankApi, {
    method:"PATCH",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json"
    },
    body
  });

  return await piggyBank.json();
}

/**
 * 
 * @param fields fields for piggy bank delete
 */
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


// obligatory
/**
 * 
 * @param fields fields to create obligatory
 * @returns created obligatory in db
 */
export const createObligatory = async (fields: {
  belongsToAccountWithId: string,
  title: string,
  amount?: string,
  dateRange: [Date | null, Date | null],
  startDate: string,
  endDate: string,
  description?: string
}) => {
  const body = JSON.stringify(fields);
  const obligatory = await fetch(createObligatoryApi, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json"
    },
    body
  });

  return await obligatory.json();
}

/**
 * 
 * @param fields fields to edit obligatory
 * @returns edited obligatory in db
 */
export const editObligatory = async (fields: {
  belongsToAccountWithId: string,
  obligatoryId: string,
  fields: {
    year?: number,
    months?: number[],
    title?: string,
    amount?: string,
    dateRange?: [Date | null, Date | null],
    startDate?: string,
    endDate?: string,
    description?: string
  }
}) => {
  const body = JSON.stringify(fields);
  const obligatory = await fetch(editObligatoryApi, {
    method: "PATCH",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json"
    },
    body
  });

  return await obligatory.json();
}

/**
 * 
 * @param fields fields for obligatory delete
 */
export const deleteObligatory = async (fields: {belongsToAccountWithId: string, obligatoryId: string}) => {
  const body = JSON.stringify(fields);
  await fetch (deleteObligatoryApi, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json"
    },
    body
  });
}