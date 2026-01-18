import translations from "../../assets/translation.js";
import { useSelector } from "react-redux";
import "./privacyStatement.css";

const PrivacyStatement = () => {
  const language = useSelector((state) => state.language.language);
  const t = translations[language];
  return (
    <div className="text-box">
      <h2> {t.privacy_statement}</h2>
      <div>{t.privacyStatementText}</div>
      <ol>
        <li className="privacy-chapter">{t.registrar}</li>
        <p className="privacy-text">Liika</p>
        <li className="privacy-chapter">
          {t.registrarContacts}
          <p className="privacy-text">Annakaisa Turunen</p>
          <p className="privacy-text">
            <a href="mailto:annaturu@uef.fi">annaturu@uef.fi</a>
          </p>
          <p className="privacy-text">{t.dataProtectionOfficer}</p>
          <p className="privacy-text">Paulus Ollikainen</p>
          <p className="privacy-text">
            <a href="mailto:ollikpau@uef.fi">ollikpau@uef.fi</a>
          </p>
        </li>
        <li className="privacy-chapter">
          {t.nameOfTheRegister}
          <p className="privacy-text">{t.liikaRegister}</p>
        </li>
        <li className="privacy-chapter">{t.legalBasisText}</li>
        <p className="privacy-text">{t.euGeneralDataText}</p>
        <ul>
          <li className="privacy-subchapter">{t.consentOfThePersonText}</li>
          <li className="privacy-subchapter">{t.anAgreementText}</li>
        </ul>
        <p className="privacy-text">{t.personalDataText}</p>
        <ul>
          <li className="privacy-subchapter">{t.providingText}</li>
          <li className="privacy-subchapter">{t.userRelationshipText}</li>
        </ul>
        <p className="privacy-text">{t.theInformationText}</p>
        <li className="privacy-chapter">{t.dataContentText}</li>
        <p className="privacy-text">{t.informationStoredText}</p>
        <ul>
          <li className="privacy-subchapter">{t.emailAddress}</li>
          <li className="privacy-subchapter">{t.ipAddressText}</li>
          <li className="privacy-subchapter">{t.locationText}</li>
        </ul>
        <p className="privacy-text">{t.ipAddTextFull}</p>
        <li className="privacy-chapter">{t.regularTransferText}</li>
        <p className="privacy-text">{t.dataIsNotText}</p>
        <p className="privacy-text">{t.weStoreYourDataText}</p>
        <li className="privacy-chapter">{t.thePrinciplesText}</li>
        <p className="privacy-text">{t.handledCarefullyText}</p>
        <li className="privacy-chapter">{t.theRightText}</li>
        <p className="privacy-text">{t.everyPersonText}</p>
        <li className="privacy-chapter">{t.otherRightsText}</li>
        <p className="privacy-text">{t.personInTheRegisterText}</p>
      </ol>
    </div>
  );
};

export default PrivacyStatement;
