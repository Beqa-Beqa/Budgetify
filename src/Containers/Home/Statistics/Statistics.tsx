import { useContext, useEffect, useState } from "react";
import "./statistics.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { divideByThousands, getCategoryNameById, getGlobalTimeUnix, removeThousandsCommas } from "../../../Functions";
import { MdOutlineCalendarMonth } from "react-icons/md";
import { AuthContext } from "../../../Contexts/AuthContextProvider";
import StatisticsHeader from "../../../Components/Home/Statistics/Header/StatisticsHeader";
import StatisticsField from "../../../Components/Home/Statistics/Field/StatisticsField";
import CategoriesChart from "../../../Components/Home/Statistics/Charts/Categories/CategoriesChart";
import { GeneralContext } from "../../../Contexts/GeneralContextProvider";
import MonthlyChart from "../../../Components/Home/Statistics/Charts/Monthly/MonthlyChart";
import { monthsByIndex } from "../../../Data";

const Statistics = (props: {
  accountData: AccountData
}) => {
  const acc = props.accountData;
  const accCreationDate = new Date(parseInt(acc.creationDate));

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [startDateString, endDateString] = dateRange.map(date => date?.toLocaleString().split(",")[0].split("/").join("."));

  useEffect(() => {
    const fetchDate = async () => {
      const time = await getGlobalTimeUnix();
      const timeInDate = new Date(time);
      setDateRange([accCreationDate, timeInDate]);
    }

    fetchDate();
  }, [acc]);

  const {transactionsData, categoriesData} = useContext(AuthContext);
  const {width} = useContext(GeneralContext);

  const transactionsByAcc = transactionsData.filter(transaction => transaction.belongsToAccountWithId === acc._id)
                                            .filter(transaction => {
                                              const transactionDate = new Date(transaction.date).getTime();
                                              if(startDate && endDate) {
                                                return transactionDate >= startDate.getTime() && transactionDate <= endDate.getTime();
                                              }
                                            });

  const transactionsByMonths = transactionsByAcc.reduce((obj: {[key: string]: TransactionData[]}, transaction) => {
    const transactionMonth = parseInt(transaction.date.split("-")[1]);
    const month = monthsByIndex[(transactionMonth - 1).toString()];
    const existingData = obj[month];

    if(existingData) {
      obj[month] = [...existingData, transaction];
    } else {
      obj[month] = [transaction];
    }

    return obj;
  }, {});

  const expenseTransactions = transactionsByAcc.filter(transaction => transaction.transactionType === "Expenses");
  const expenseTransactionCategories = expenseTransactions.reduce((categories: string[], transaction) => {
    for(let category of transaction.chosenCategories) {
      if(categories.indexOf(category) === -1) {
        categories.push(category);
      }
    }

    return categories;
  }, []);
  const totalExpenses = expenseTransactions.reduce((amount: number, transaction) => {
    amount += removeThousandsCommas(transaction.amount);
    return amount;
  }, 0);

  const [filter, setFilter] = useState<"Category" | "Monthly">("Category");

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  return (
    <div className="row container-fluid justify-content-center flex-wrap">
      <div className={`statistics ${filter === "Category" && "col-xxl-7"} d-flex flex-column ${filter === "Category" ? "align-items-center" : "align-items-start"} gap-4`}>
        <div className={`d-flex align-items-center ${filter === "Category" ? "w-100" : "col-md-7 col-12"}`}>
          <div style={{zIndex: 5}} onClick={() => setFilter("Category")} role="button" className={`statistics-filter-button position-relative ${filter === "Category" && "selected"} rounded-4 text-center py-3 w-100`}>
            <span className="fs-5">Categories Statistic</span>
          </div>
          <div style={{left: -13}} onClick={() => setFilter("Monthly")} role="button" className={`statistics-filter-button border-start-0 position-relative ${filter === "Monthly" && "selected" } rounded-end-4 text-center py-3 w-100`}>
            <span className="fs-5">Monthly Statistic</span>
          </div>
        </div>
        <div className={`date-range-container d-flex justify-content-between py-3 px-3 ${filter === "Category" ? "w-100" : "col-md-7 col-12"} rounded-4`}>
          <div className="d-flex flex-column gap-2">
            <span style={{fontSize: 15, color: "var(--placeholder)"}}>Date Range</span>
            <span className="fs-5">{startDateString} - {endDateString}</span>
          </div>
          <div className="position-relative d-flex flex-column align-items-end">
            <div onClick={() => setShowDatePicker(prev => !prev)}>
              <MdOutlineCalendarMonth role="button" style={{width: 30, height: 30}} />
            </div>
            {showDatePicker &&
              <div style={{top: 30, zIndex: 10}} className="position-absolute">
                <DatePicker
                  toggleCalendarOnIconClick
                  showIcon
                  shouldCloseOnSelect
                  onClickOutside={() => setShowDatePicker(false)}
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => {
                    setDateRange(update);
                  }}
                  inline
                />
              </div>
            }
          </div>
        </div>
        {filter === "Category" ?
          <>
            <div className="expenses-container py-3 px-3 w-100 rounded-4">
              <div className="d-flex flex-column gap-2">
                <span style={{fontSize: 15, color: "var(--placeholder)"}}>Total Expenses</span>
                <span style={{color: "var(--danger)"}} className="fs-4">{divideByThousands(totalExpenses)}{acc.currency.split(" ")[1]}</span>
              </div>
            </div>
            <div className="table-container w-100">
              {expenseTransactionCategories.length ?
                <>
                  <StatisticsHeader fields={["Category", "Amount", "% in total"]} />
                  {expenseTransactionCategories.map((category, key: number) => {
                    const categ = getCategoryNameById(categoriesData, category) || category;
                    const hasLine = key !== expenseTransactionCategories.length - 1;
                    const expensesByCategory = expenseTransactions.filter(transaction => transaction.chosenCategories.indexOf(category) !== -1);
                    const amountByCategory = expensesByCategory.reduce((amount: number, transaction) => {
                      amount += removeThousandsCommas(transaction.amount)
                      return amount;
                    }, 0);
                    const currency = acc.currency.split(" ")[1];
                    const amount = divideByThousands(amountByCategory) + " " + currency;
                    const percentage = (amountByCategory / totalExpenses * 100).toFixed(2) + "%";

                    return (
                      <StatisticsField
                        key={key}
                        hasLine={hasLine}
                        classname={`${!hasLine && "rounded-bottom-4"}`}
                        fields={[categ, amount, percentage]}
                      />
                    )
                  })}
                </>
              :
                <div className="w-100 text-center my-3 overflow-hidden">
                  <h2 style={{color: "var(--placeholder)"}} className="fs-2 opacity-25">There is no data to be displayed</h2>
                </div>
              }
            </div>
          </>
        :
          <>
            {transactionsByAcc.length ?
              <div className="d-flex flex-column w-100 table-container">
                <StatisticsHeader fields={["Month", "Income", "Expenses", "Economy", "% of economy"]} />
                {Object.keys(transactionsByMonths).map((transactionKey, key) => {
                  const hasLine = key !== Object.keys(transactionsByMonths).length - 1;
                  const month = transactionKey;
                  const transactions = transactionsByMonths[month];
                  const totalIncomeByMonth = transactions.reduce((amount: number, transaction) => {
                    if(transaction.transactionType === "Income") {
                      amount += removeThousandsCommas(transaction.amount);
                    }
                    return amount;
                  }, 0);
                  const totalExpenseByMonth = transactions.reduce((amount: number, transaction) => {
                    if(transaction.transactionType === "Expenses") {
                      amount += removeThousandsCommas(transaction.amount);
                    }
                    return amount
                  }, 0);
                  const economy = (totalIncomeByMonth - totalExpenseByMonth);
                  const economyInPercent = economy !== 0 && totalIncomeByMonth ? (economy / totalIncomeByMonth * 100) : economy;
                
                  const color = economy < 0 ? "var(--danger)" : "var(--success)";

                  return (
                    <StatisticsField 
                      fields={[month, totalIncomeByMonth.toFixed(2) + "$", totalExpenseByMonth.toFixed(2) + "$", economy.toFixed(2) + "$", economyInPercent.toFixed(2) + "%"]}
                      fieldColors={[[3, color], [4, color]]}
                      key={key}
                      hasLine={hasLine}
                      classname={`${!hasLine && "rounded-bottom-4"}`}
                    />
                  );
                })}
              </div>
            : null}
          </>
        }
      </div>
      <div style={{width: filter === "Category" ? 450 : 600, display: filter === "Category" ? width < 500 ? "none" : "initial" : width < 650 ? "none" : "initial"}}>
        {
          filter === "Category" ? 
            <CategoriesChart statisticsData={expenseTransactions} />
          : 
            <MonthlyChart statisticsData={transactionsByMonths} /> 
        }
      </div>
    </div>
  );
}

export default Statistics;