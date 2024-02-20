export const accountExistsByTitle = (accArr: AccountData[], title: string) => {
  const foundAcc = accArr.find(acc => acc.title.toLocaleLowerCase() === title.toLocaleLowerCase());
  return foundAcc;
}

export const makeFirstCapitals = (str: string) => {
  const returnWords = [];
  const splitStr = str.split(" ");
  
  for(let word of splitStr) {
    let firstUpNextLow = word.toLocaleLowerCase().split("");
    firstUpNextLow[0] = firstUpNextLow[0].toLocaleUpperCase();
    returnWords.push(firstUpNextLow.join(""));
  }

  return returnWords.join(" ");
}