import "./header.css";
import { useContext, useState } from "react";
import { UserIcon } from "../../../Assets/Home";
import { GeneralContext } from "../../../Contexts/GeneralContextProvider";
import { RxHamburgerMenu } from "react-icons/rx";
import { AuthContext } from "../../../Contexts/AuthContextProvider";
import ActionPrompt from "../../../Components/Home/ActionPrompt/ActionPrompt";
import SideNavbarMenu from "../../../Components/Home/SideMenus/Navbar/SideNavbarMenu";
 
const Header = () => {
  const {currentUserData, setCurrentUserData} = useContext(AuthContext);

  // User data
  const userData = (currentUserData as CurrentUserData).data;

  // window inner width.
  const {width, showToastMessage, setShowToastMessage} = useContext(GeneralContext);

  // State for profile dropdown menu.
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  // State for logout prompt.
  const [showLogoutPrompt, setShowLogoutPrompt] = useState<boolean>(false);
  // state for showing sidemenu.
  const [showSideNavbarMenu, setShowSideNavbarMenu] = useState<boolean>(false);

  const handleLogout = () => {
    // Clear state of currentuserdata.
    setCurrentUserData({});
    // Clear cache.
    window.sessionStorage.removeItem("Budgetify-user-data");
  }

  return (
    <>
      <div className="homepage-header mt-4 mt-xl-0 container-fluid">
        <div className="row justify-content-between align-items-cente position-relative">
          <h1 className="homepage-mini-logo pb-2 col col-lg-2 col-xl-4 col-xxl-4 fw-bold">Budgetify</h1>
          {width >= 992 &&
            <div className="position-relative col-lg-7 col-xl-6 col-xxl-5 p-0">
              <div className={`toast-message ${showToastMessage.show && "active"} d-flex justify-content-between align-items-center rounded fs-5 py-3 px-5`}>
                <span>{showToastMessage.text}</span>
                <span onClick={() => setShowToastMessage({show: false, text: ""})} className="fw-bold" role="button">Close</span>
              </div>
              <nav className="navbar p-0">
                <ul className="d-flex justify-content-between w-100">
                  <li>Categories</li>
                  <li>Subscriptions</li>
                  <li>Obligatory</li>
                  <li>Statistic</li>
                  <li>Admin</li>
                </ul>
              </nav>
            </div>
          }
          <div className="profile-corner pb-2 col col-lg-2 col-xl-2 col-xxl-2 d-flex justify-content-end">
            <div className="d-flex w-100 justify-content-end align-items-center gap-3 position-relative" style={{maxWidth: 150}}>
              {width < 992 && <div onClick={() => setShowSideNavbarMenu(true)} role="button">
                  <RxHamburgerMenu style={{width: 20, height: 20}} />
                </div>
              }
              <div onClick={() => setShowProfileDropdown(prev => !prev)} role="button" className="d-flex align-items-center gap-2">
                <img src={UserIcon} alt="user"/>
                <h2>{userData.name}</h2>
              </div>
              {showProfileDropdown &&
                <ul style={{zIndex: 200}} className="profile-dropdown position-absolute w-100 rounded py-2">
                  <li onClick={() => {setShowLogoutPrompt(true); setShowProfileDropdown(false);}} role="button" className="py-2 text-center">
                    Logout
                  </li>
                </ul>
              }
            </div>
          </div>
        </div>
      </div>
      {showLogoutPrompt && 
        <ActionPrompt
          text="Are you sure that you want to logout?"
          cancel={{action: () => setShowLogoutPrompt(false), text: "Cancel"}}
          confirm={{action: handleLogout, text: "Confirm"}}
        />
      }
      {
        width < 992 && <SideNavbarMenu classname={showSideNavbarMenu ? "show" : ""} setShowSideNavbarMenu={setShowSideNavbarMenu} />
      }
    </>
  );
}

export default Header;