import "bootstrap/dist/css/bootstrap.css";
import { Authentication, Homepage } from "./Pages";
import { useContext, useEffect } from "react";
import { AuthContext } from "./Contexts/AuthContextProvider";

function App() {
  // Current user data that will display user related info.
  const {currentUserData, setCurrentUserData} = useContext(AuthContext);

  // Useffect that reruns after currentuser changes.
  useEffect(() => {
    // If currentUserData is present (has keys and is not an empty object), setTimeout.
    // After 1 hour, data will be cleared from sessionStorage as well from currentUserData state.
    const timeOut = Object.keys(currentUserData).length && setTimeout(() => {
      setCurrentUserData({});
      window.sessionStorage.removeItem("Budgetify-user-data");
    }, 1000 * 60 * 60);

    // Clear timeout on component unmount.
    return () => clearTimeout(timeOut);
  }, [currentUserData]);

  // If currentUserData is empty (that is user is not logged in), show authentication page.
  if(!Object.keys(currentUserData).length) {
    return <Authentication />
  } else {
    // Otherwise show homepage
    return <Homepage />
  }
}

export default App
