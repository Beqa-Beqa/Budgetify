import { createContext, useEffect, useState } from "react";

// Window innerwidth context
export const GeneralContext = createContext<{
  width: number
}>({
  width: 0
});

// General context provider.
const GeneralContextProvider = ({children}: {children: React.ReactNode}) => {
  // state for holding window innerwidth.
  const [width, setWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    // resize handler.
    const handleResize = () => setWidth(window.innerWidth);

    // Add event to window resize.
    window.addEventListener("resize", handleResize);

    // remove eventlistener on component unmount.
    return () => window.removeEventListener("resize", handleResize);
  }, [])

  return <GeneralContext.Provider value={{width}}>
    {children}
  </GeneralContext.Provider>
}

export default GeneralContextProvider;