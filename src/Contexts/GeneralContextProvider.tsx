import { createContext, useEffect, useState } from "react";

// Window innerwidth context
export const GeneralContext = createContext<{
  width: number,
  showToastMessage: {show: boolean, text: string},
  setShowToastMessage: React.Dispatch<React.SetStateAction<{
    show: boolean;
    text: string;
  }>>,
  navigateTo: "none" | "Categories" | "Subscriptions" | "Obligatory" | "Statistic" | "Admin",
  setNavigateTo: React.Dispatch<React.SetStateAction<"none" | "Categories" | "Subscriptions" | "Obligatory" | "Statistic" | "Admin">>,
  showAddCategoryPrompt: boolean,
  setShowAddCategoryPrompt: React.Dispatch<React.SetStateAction<boolean>>
}>({
  width: 0,
  showToastMessage: {show: false, text: ""},
  setShowToastMessage: () => {},
  navigateTo: "none",
  setNavigateTo: () => {},
  showAddCategoryPrompt: false,
  setShowAddCategoryPrompt: () => {}
});

// General context provider.
const GeneralContextProvider = ({children}: {children: React.ReactNode}) => {
  // state for holding window innerwidth.
  const [width, setWidth] = useState<number>(window.innerWidth);
  // state for showing toast message.
  const [showToastMessage, setShowToastMessage] = useState<{show: boolean, text: string}>({show: false, text: ""});
  // state for navigation bar.
  const [navigateTo, setNavigateTo] = useState<"none" | "Categories" | "Subscriptions" | "Obligatory" | "Statistic" | "Admin">("none");
  // category state
  const [showAddCategoryPrompt, setShowAddCategoryPrompt] = useState<boolean>(false);

  useEffect(() => {
    // resize handler.
    const handleResize = () => setWidth(window.innerWidth);

    // Add event to window resize.
    window.addEventListener("resize", handleResize);

    // remove eventlistener on component unmount.
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // If toast message appears, disappear it in 5 seconds.
    const timeout = showToastMessage.show && 
      setTimeout(() => setShowToastMessage({show: false, text: ""}), 5000);

    return () => timeout ? clearTimeout(timeout) : undefined;
  }, [showToastMessage]);

  return <GeneralContext.Provider value={{width, showToastMessage, setShowToastMessage, navigateTo, setNavigateTo, showAddCategoryPrompt, setShowAddCategoryPrompt}}>
    {children}
  </GeneralContext.Provider>
}

export default GeneralContextProvider;