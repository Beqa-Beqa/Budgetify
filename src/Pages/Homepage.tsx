import Header from "../Containers/Home/Header";
import Main from "../Containers/Home/Main";
import "../CSS/homepage.css";

const Homepage = () => {
  return (
    <>
      <header className="py-4 px-xxl-5 p-xl-4 px-lg-3 px-md-2 px-1">
        <Header />
      </header>
      <main className="py-3 px-xxl-5 p-xl-4 px-lg-3 px-md-2 px-1">
        <Main />
      </main>
    </>
  );
}

export default Homepage;