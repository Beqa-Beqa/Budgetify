import Header from "../Components/Home/Header";
import "../CSS/homepage.css";

const Homepage = (props: {
  currentUserData: CurrentUserData | {},
  setCurrentUserData: React.Dispatch<React.SetStateAction<{} | CurrentUserData>>
}) => {
  return (
    <>
      <header className="py-4 px-lg-5 mx-md-3 px-1">
        {'data' in props.currentUserData && <Header currentUserData={props.currentUserData} setCurrentUserData={props.setCurrentUserData} />}
      </header>
      <main>

      </main>
    </>
  );
}

export default Homepage;