import logo from "../assets/liika_logo.png";
import backBtn from "../assets/backBtn.png";
import home from "../assets/home.png";
import { useNavigate } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const Header = ({ backButton }) => {
  const navigate = useNavigate();

  return (
    <div className="header">
      {!backButton && (
        <img
          src={backBtn}
          width={30}
          height={30}
          className="header-back-btn"
          onClick={() => navigate(-1)}
        />
      )}
      <img
        src={logo}
        alt="Logo"
        width={135}
        height={125}
        className="logo"
        onClick={() => navigate("/map")}
      />
      {!backButton && (
        <img
          src={home}
          width={30}
          height={30}
          className="header-back-btn"
          onClick={() => navigate("/")}
        />
      )}
    </div>
  );
};

export default Header;
