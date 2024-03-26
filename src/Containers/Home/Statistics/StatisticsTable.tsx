import { useContext, useEffect, useState } from "react";
import "./statistics.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { divideByThousands, getGlobalTimeUnix, removeThousandsCommas } from "../../../Functions";
import { MdOutlineCalendarMonth } from "react-icons/md";
import { AuthContext } from "../../../Contexts/AuthContextProvider";

const StatisticsTable = (props: {
  accountData: AccountData
}) => {
  const acc = props.accountData;
  const accCreationDate = new Date(parseInt(acc.creationDate));

  const {transactionsData} = useContext(AuthContext);

  const transactionsByAcc = transactionsData.filter(transaction => transaction.belongsToAccountWithId === acc._id);
  const totalExpenses = transactionsByAcc.reduce((amount, transaction) => {
    amount += removeThousandsCommas(transaction.amount);
    return amount;
  }, 0);

  const [filter, setFilter] = useState<"Category" | "Monthly">("Category");

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

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

  return (
    <div className="statistics d-flex flex-column align-items-center gap-4 w-100">
      <div className="d-flex align-items-center w-100">
        <div style={{zIndex: 5}} onClick={() => setFilter("Category")} role="button" className={`statistics-filter-button position-relative ${filter === "Category" && "selected"} rounded-4 text-center py-3 w-100`}>
          <span className="fs-5">Categories Statistic</span>
        </div>
        <div style={{left: -13}} onClick={() => setFilter("Monthly")} role="button" className={`statistics-filter-button border-start-0 position-relative ${filter === "Monthly" && "selected" } rounded-end-4 text-center py-3 w-100`}>
          <span className="fs-5">Monthly Statistic</span>
        </div>
      </div>
      <div className="date-range-container d-flex justify-content-between py-3 px-3 w-100 rounded-4">
        <div className="d-flex flex-column gap-2">
          <span style={{fontSize: 15, color: "var(--placeholder)"}}>Date Range</span>
          <span className="fs-5">{startDateString} - {endDateString}</span>
        </div>
        <div className="position-relative d-flex flex-column align-items-end">
          <div onClick={() => setShowDatePicker(prev => !prev)}>
            <MdOutlineCalendarMonth role="button" style={{width: 30, height: 30}} />
          </div>
          {showDatePicker &&
            <div style={{top: 30}} className="position-absolute">
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
      <div className="expenses-container py-3 px-3 w-100 rounded-4">
        <div className="d-flex flex-column gap-2">
          <span style={{fontSize: 15, color: "var(--placeholder)"}}>Total Expenses</span>
          <span style={{color: "var(--danger)"}} className="fs-4">{divideByThousands(totalExpenses)}{acc.currency.split(" ")[1]}</span>
        </div>
      </div>
    </div>
  );
}

export default StatisticsTable;