import "../../CSS/Containers/main.css";
import Card from "../../Components/Home/Card";
import MainSearch from "../../Components/Home/MainSearch";
import { useContext, useState } from "react";
import IndicatorButton from "../../Components/Home/IndicatorButton";
import { AuthContext } from "../../Contexts/AuthContextProvider";
import AddAccountPrompt from "./AddAccountPrompt";

const Main = () => {
  // list of accounts data.
  const {accountsData} = useContext(AuthContext);
  // sort setting holder state.
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  // active card holder state.
  const [activeCard, setActiveCard] = useState<number>(0);

  // State for to show add account prompt or not.
  const [showAddAccountPrompt, setShowAddAccountPrompt] = useState<boolean>(false);

  return (
    <div className="homepage-main container-fluid">
      <div className="row row-wrap justify-content-between">
        <div className="col-xl-4 col-12 d-flex flex-column gap-4">
          <div className="position-relative cards-container d-flex flex-row flex-xl-column gap-5 pb-4 pe-xl-3">
            {accountsData.length ? accountsData.map((account: AccountData, key: number) => {
              const isActive = key === activeCard;
              const handleClick = () => setActiveCard(key);

              return <Card accountData={account} onclick={handleClick} active={isActive} classname="col-xxl col-xl-12 col-md-5 col-12" key={key}  />
            }) : null}

          </div>
          <div className="w-100 pe-xl-3">
            <Card onclick={() => setShowAddAccountPrompt(true)} classname="active align-self-md-center col-xxl col-xl-12 col-md-5 col mb-4 mb-xl-0" />
          </div>
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
      {
        showAddAccountPrompt && <AddAccountPrompt setShowAddAccountPrompt={setShowAddAccountPrompt} />
      }
    </div>
  );
}

export default Main;