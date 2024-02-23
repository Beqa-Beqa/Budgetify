import "./mainSearch.css";
import { IoSearch } from "react-icons/io5";
import { GoSortDesc, GoSortAsc } from "react-icons/go";

const MainSearch = (props: {
  sort: "desc" | "asc",
  setSort: React.Dispatch<React.SetStateAction<"desc" | "asc">>
}) => {
  const {sort, setSort} = props;

  return (
    <div className="w-100">
      <div className="homepage-main-search-container d-flex align-items-center position-relative w-100">
        <input
          placeholder="Search"
          className="homepage-main-search ps-5 pe-3" 
          type="text" 
        />
        <div role="button" style={{left: 12}} className="search-icon position-absolute p-1">
          <IoSearch style={{width: 22, height: 22}} />
        </div>
      </div>
      <div className="my-2 mx-3 sort-button">
        <span 
          role="button" 
          className="user-select-none" 
          style={{opacity: 0.7}}
          onClick={() => setSort(prev => prev === "asc" ? "desc" : "asc")}
        >
          {sort === "desc" ? <GoSortDesc/> : <GoSortAsc />} Transaction Date
        </span>
      </div>
    </div>
  );
}

export default MainSearch;