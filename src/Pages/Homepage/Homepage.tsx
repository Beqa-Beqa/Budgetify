import Header from "../../Containers/Home/Header/Header";
import Main from "../../Containers/Home/Main/Main";
import "./homepage.css";

const Homepage = () => {
  return (
    <>
      <header className="px-xxl-5 p-xl-4 px-lg-3 px-md-2 px-1">
        <Header />
      </header>
      <main className="py-3 px-xxl-5 p-xl-4 px-lg-3 px-md-2 px-1">
        <Main />
      </main>
    </>
  );
}

export default Homepage;