import { useContext, useState } from "react";
import { UserIcon } from "../../Assets/Home";
import "./header.css";
import { Button } from "react-bootstrap";
import { GeneralContext } from "../../Contexts/GeneralContextProvider";
import { RxHamburgerMenu } from "react-icons/rx";
 
const Header = (props: {
  currentUserData: CurrentUserData,
  setCurrentUserData: React.Dispatch<React.SetStateAction<{} | CurrentUserData>>
}) => {
  // User data
  const userData: UserData = props.currentUserData.data;

  // window inner width.
  const {width} = useContext(GeneralContext);

  // State for profile dropdown menu.
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  // State for logout prompt.
  const [showLogoutPrompt, setShowLogoutPrompt] = useState<boolean>(false);

  const handleLogout = () => {
    props.setCurrentUserData({});
    window.sessionStorage.removeItem("Budgetify-user-data");
  }

  return (
    <>
      <div className="homepage-header container-fluid">
        <div className="row justify-content-between align-items-cente">
          <h1 className="homepage-mini-logo col col-lg-2 col-xl-4 col-xxl-4 fw-bold">Budgetify</h1>
          {width >= 992 &&
            <nav className="navbar col-lg-7 col-xl-6 col-xxl-5 p-0">
              <ul className="d-flex justify-content-between w-100">
                <li>Categories</li>
                <li>Subscriptions</li>
                <li>Obligatory</li>
                <li>Statistic</li>
                <li>Admin</li>
              </ul>
            </nav>
          }
          <div className="profile-corner col col-lg-2 col-xl-2 col-xxl-2 d-flex justify-content-end">
            <div className="d-flex w-100 justify-content-end align-items-center gap-3 position-relative" style={{maxWidth: 150}}>
              {width < 992 && <RxHamburgerMenu role="button" style={{width: 20, height: 20}} />}
              <div onClick={() => setShowProfileDropdown(prev => !prev)} role="button" className="d-flex align-items-center gap-2">
                <img src={UserIcon} alt="user"/>
                <h2>{userData.name}</h2>
              </div>
              {showProfileDropdown &&
                <ul className="profile-dropdown position-absolute w-100 rounded py-2">
                  <li onClick={() => setShowLogoutPrompt(true)} role="button" className="py-2 text-center">
                    Logout
                  </li>
                </ul>
              }
            </div>
          </div>
        </div>
      </div>
      {showLogoutPrompt && <div className="prompt">
          <div className="prompt-box p-3 rounded">
            <h5 className="mb-5">Are you sure that you want to logout?</h5>
            <div className="prompt-box-actions-container d-flex justify-content-center gap-3">
              <Button onClick={handleLogout} className="action-button" variant="outline-dark">
                Confirm
              </Button>
              <Button onClick={() => setShowLogoutPrompt(false)} className="action-button" variant="outline-dark">
                Cancel
              </Button>
            </div>
          </div>
      </div>}
    </>
  );
}

export default Header;