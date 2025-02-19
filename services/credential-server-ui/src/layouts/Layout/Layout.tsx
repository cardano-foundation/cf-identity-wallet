import { Outlet } from "react-router";
import { NavBar } from "../../components/NavBar/NavBar";

const Layout = () => {
  return (
    <>
      <NavBar />
      <main>
        <Outlet />
      </main>
    </>
  );
};

export { Layout };
