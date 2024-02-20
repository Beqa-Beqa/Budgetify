export const accountExistsByTitle = (accArr: AccountData[], title: string) => {
  const foundAcc = accArr.find(acc => acc.title === title);
  return foundAcc;
}