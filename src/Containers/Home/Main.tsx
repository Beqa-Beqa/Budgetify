import "./Main.css";
import Card from "../../Components/Home/Card";
import MainSearch from "../../Components/Home/MainSearch";
import { useState } from "react";
import IndicatorButton from "../../Components/Home/IndicatorButton";

const Main = () => {
  const [sort, setSort] = useState<"desc" | "asc">("desc");

  return (
    <div className="homepage-main container-fluid">
      <div className="row justify-content-between">
        <div className="col-xl-4 col-12 d-flex flex-column gap-5 mb-5 mb-xl-0">
          <Card title="Credit Card" amount="5,356.18" currency="$" />
        </div>
        <div className="col-xxl-5 col-xl-6 col-lg-9 p-xl-0">
          <MainSearch sort={sort} setSort={setSort}/>
          <div className="container-fluid">
            {/* For content */}
          </div>
        </div>
        <div className="col-xl-2 col-lg-3">
          <div className="d-flex flex-column align-items-end gap-3">
            <IndicatorButton type="Income" />
            <IndicatorButton type="Expenses"/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;