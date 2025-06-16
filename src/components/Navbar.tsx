import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Dashboard } from "./Icons/Dashboard";
import { Favourites } from "./Icons/Favourites";
import { GreenDashboard } from "./Icons/GreenDashboard";
import { GreenFavourites } from "./Icons/GreenFavourites";
import { GreenHome } from "./Icons/GreenHome";
import { GreenZoom } from "./Icons/GreenZoom";
import { Home } from "./Icons/Home";
import { Zoom } from "./Icons/Zoom";
export const Navbar = () => {
  const pathname = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState<string>("main");

  useEffect(() => {
    if (pathname.pathname === "/") {
      setActive("main");
    } else if (pathname.pathname === "/search") {
      setActive("search");
    } else if (pathname.pathname === "/quizzes") {
      setActive("quizzes");
    } else if (pathname.pathname === "/leaders") {
      setActive("leaders");
    }
  }, [pathname]);

  console.log(pathname.pathname);
  console.log(active);
  return (
    <div className="fixed right-0 bottom-0 left-0 z-1 flex items-center justify-between bg-black p-4">
      <div
        className="flex flex-col items-center justify-center gap-1"
        onClick={() => navigate({ to: "/" })}
      >
        {active === "main" ? <GreenHome /> : <Home />}
        <p
          className={`font-normal ${active === "main" ? "text-[#6CED52]" : "text-white"}`}
        >
          Главная
        </p>
      </div>
      <div
        className="flex flex-col items-center justify-center gap-1"
        // onClick={() => navigate({ to: "/search" })}
      >
        {active === "search" ? <GreenZoom /> : <Zoom />}
        <p
          className={`font-normal ${
            active === "search" ? "text-[#6CED52]" : "text-white"
          }`}
        >
          Поиск
        </p>
      </div>
      <div
        className="flex flex-col items-center justify-center gap-1"
        onClick={() => navigate({ to: "/quizzes" })}
      >
        {active === "quizzes" ? <GreenDashboard /> : <Dashboard />}
        <p
          className={`font-normal ${
            active === "quizzes" ? "text-[#6CED52]" : "text-white"
          }`}
        >
          Квизы
        </p>
      </div>
      <div
        className="flex flex-col items-center justify-center gap-1"
        // onClick={() => navigate({ to: "/leaders" })}
      >
        {active === "leaders" ? <GreenFavourites /> : <Favourites />}
        <p
          className={`font-normal ${
            active === "leaders" ? "text-[#6CED52]" : "text-white"
          }`}
        >
          Лидеры
        </p>
      </div>
    </div>
  );
};
