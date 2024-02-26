import { HiXMark } from "react-icons/hi2";
import "../../../../Containers/Home/Header/header.css";

const SideNavbarMenu = (props: {
  classname?: string,
  setShowSideNavbarMenu: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  return (
    <div className={`${props.classname === "show" ? "prompt" : ""}`}>
      <div className={`prompt-box ${props.classname} w-100 p-3 homepage-header`}>
        <div className="w-100 d-flex justify-content-end">
          <div role="button" onClick={() => props.setShowSideNavbarMenu(false)}>
            <HiXMark style={{width: 25, height: 25}} />
          </div>
        </div>
        <nav className="navbar">
          <ul className="d-flex flex-column gap-3 w-100">
            <li>Categories</li>
            <li>Subscriptions</li>
            <li>Obligatory</li>
            <li>Statistics</li>
            <li>Admin</li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default SideNavbarMenu;