import Header from "../Containers/Home/Header";
import Main from "../Containers/Home/Main";
import "../CSS/homepage.css";

const Homepage = (props: {
  currentUserData: CurrentUserData | {},
  setCurrentUserData: React.Dispatch<React.SetStateAction<{} | CurrentUserData>>
}) => {
  return (
    <>
      <header className="py-4 px-xxl-5 p-xl-4 px-lg-3 px-md-2 px-1">
        {'data' in props.currentUserData && <Header currentUserData={props.currentUserData} setCurrentUserData={props.setCurrentUserData} />}
      </header>
      <main className="py-3 px-xxl-5 p-xl-4 px-lg-3 px-md-2 px-1">
        {'data' in props.currentUserData && <Main />}
      </main>
    </>
  );
}

export default Homepage;