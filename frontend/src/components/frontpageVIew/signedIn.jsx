import { useSelector } from "react-redux";
import translations from "../../assets/translation";
import { useState } from 'react';

const SignedIn = () => {
  const language = useSelector((state) => state.language.language);
  const t = translations[language];
  const [disabled, setDisabled] = useState(false);

  const handler = () => {
    setDisabled(true)
    window.localStorage.clear();
    window.location.reload();
  };

  return (
    <div>
      <button className="register-frontpage-btn" onClick={() => handler()} disabled={disabled}>
        {t.logOut}
      </button>
    </div>
  );
};

export default SignedIn;
