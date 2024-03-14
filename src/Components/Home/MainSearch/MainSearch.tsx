import "./mainSearch.css";
import { IoSearch } from "react-icons/io5";
import { GoSortDesc, GoSortAsc } from "react-icons/go";
import IndicatorButton from "../IndicatorButton/IndicatorButton";
import { useContext } from "react";
import { GeneralContext } from "../../../Contexts/GeneralContextProvider";

const MainSearch = (props: {
  sortByPaymentDate: "desc" | "asc",
  setSortByPaymentDate: React.Dispatch<React.SetStateAction<"desc" | "asc">>,
  sortByTransaction: "Income" | "Expenses" | "",
  setSortByTransaction: React.Dispatch<React.SetStateAction<"Income" | "Expenses" | "">>,
  searchValue: string,
  setSearchValue: React.Dispatch<React.SetStateAction<string>>
}) => {
  const {sortByPaymentDate, setSortByPaymentDate} = props;
  const {navigateTo} = useContext(GeneralContext);

  const border = {border: "1px solid var(--border)"};
  const emptyBorder = {border: "1px solid transparent"};

  return (
    <div className="w-100">
      <div className="homepage-main-search-container d-flex align-items-center position-relative w-100">
        <input
          value={props.searchValue}
          onChange={(e) => {props.setSearchValue(e.target.value)}}
          placeholder="Search"
          className="homepage-main-search ps-5 pe-3" 
          type="text" 
        />
        <div role="button" style={{left: 12}} className="search-icon position-absolute p-1">
          <IoSearch style={{width: 22, height: 22}} />
        </div>
      </div>
      <div className="my-2 mx-3 sort-container d-flex align-items-center gap-4">
        {(navigateTo === "none" || navigateTo === "Subscriptions") && <span 
          role="button" 
          className="user-select-none d-flex align-items-center gap-2" 
          style={{opacity: 0.7}}
          onClick={() => setSortByPaymentDate(prev => prev === "asc" ? "desc" : "asc")}
        >
          {sortByPaymentDate === "desc" ? <GoSortDesc/> : <GoSortAsc />} {navigateTo !== "Subscriptions" ? "Transaction" : "Creation"} Date
        </span>}
        {navigateTo !== "Subscriptions" &&
          <>
            <div className="rounded px-2 py-1" style={props.sortByTransaction === "Income" ? border : emptyBorder}>
              <IndicatorButton onclick={() => props.setSortByTransaction(prev => prev !== "Income" ? "Income" : "")} role="button" classname="bg-transparent" type="Income" />
            </div>
            <div className="rounded px-2 py-1" style={props.sortByTransaction === "Expenses" ? border : emptyBorder}>
              <IndicatorButton onclick={() => props.setSortByTransaction(prev => prev !== "Expenses" ? "Expenses" : "")} role="button" classname="bg-transparent" type="Expenses" />
            </div>
          </>
        }
      </div>
    </div>
  );
}

export default MainSearch;