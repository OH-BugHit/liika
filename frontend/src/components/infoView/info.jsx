import translations from "../../assets/translation.js"
import { useSelector } from "react-redux"

const Info = () => {
  const language = useSelector((state) => state.language.language)
  const t = translations[language]

  const scrollToSection = (id, offset = 0) => {
    const section = document.getElementById(id)
    if (section) {
      const y = section.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }

  return (
    <div className="text-box">
      <h1>{t.info}</h1>
      <br />
      <div>
        <button
          onClick={() => scrollToSection("info_map", 100)}
          className="smooth-navigate-link"
        >
          {t.map}
        </button>
      </div>
      <div>
        <button
          onClick={() => scrollToSection("info_login", 100)}
          className="smooth-navigate-link"
        >
          {t.login}
        </button>
      </div>
      <div>
        <button
          onClick={() => scrollToSection("info_register", 100)}
          className="smooth-navigate-link"
        >
          {t.register}
        </button>
      </div>
      <div>
        <button
          onClick={() => scrollToSection("info_map_usage", 100)}
          className="smooth-navigate-link"
        >
          {t.mapUsage}
        </button>
      </div>
      <div>
        <button
          onClick={() => scrollToSection("info_filter", 100)}
          className="smooth-navigate-link"
        >
          {t.eventFiltering}
        </button>
      </div>
      <br />
      <div>
        <h2>{t.overview}</h2>
        <p>
          {t.liikaDescription}
        </p>
        <br />
        <h2>{t.mainFunctions}</h2>
        <div id="info_map">
          <h3>{t.map}</h3>
          <ul>
            <li>{t.browseEvents}</li>
            <li>{t.eventRegistrationNoLogin}</li>
            <li>
              {t.eventDetailsIcon}
            </li>
            <li>
              {t.eventDetailsButton}
            </li>
          </ul>
        </div>
        <h3 id="info_login">{t.login}</h3>
        <ol>
          <li>
            {t.loginPrompt}
          </li>
          <li>{t.loginButton}</li>
        </ol>

        <h3 id="info_register">{t.register}</h3>
        <ol>
          <li>
            {t.registerPrompt}
          </li>
          <li>{t.confirmPassword}</li>
          <li>{t.selectStartLocation}</li>
          <li>{t.sendConfirmationCode}</li>
          <li>{t.enterConfirmationCode}</li>
          <li>{t.completeRegistration}</li>
        </ol>
        <br />
        <h2>{t.homepage}</h2>
        <ul>
          <li>{t.homepageDescription}</li>
          <li>
            {t.goToMapView}
          </li>
        </ul>
        <br />
        <h2 id="info_map_usage">{t.mapUsage}</h2>
        <p>{t.mapButtons}</p>
        <p>
          {t.viewVariation}
        </p>
        <p>{t.partnerViewVariation}</p>
        <br />
        <h4>{t.loggedInMapView}</h4>
        <h3>{t.leftSide}</h3>
        <ul>
          <li>{t.createEvents}</li>
          <li>{t.registeredEvents}</li>
          <li>{t.createdEvents}</li>
          <li>{t.editProfile}</li>
        </ul>

        <h3>{t.rightSide}</h3>
        <ul>
          <li>{t.searchLocation}</li>
          <li>
            {t.changeMapAppearance}
            <p>
              <em>{t.editMapAppearance}</em>
            </p>
          </li>
          <li>
            {t.updateMapEvents}{" "}
            <p>
              <em>
                {t.fetchVisibleAreaEvents}
              </em>
            </p>
          </li>
        </ul>

        <h3>{t.bottomMenu}</h3>
        <ul>
          <li id="info_filter">
            {t.filterBySport}
            <p>
              <em>
                {t.selectCategories}
              </em>
            </p>
          </li>
          <li>
            {t.filterByDate}
            <p>
              <em>
                {t.selectSearches}
              </em>
            </p>
            <p>
              <em>
                {t.narrowSearch}
              </em>
              <br />
              <em>
                {"\t"}{t.selectStartDate}
                {"\n\t"}{t.selectEndDate}
                {"\n\t"}{t.pressFilter}
              </em>
              <br />
              <em>
                {t.narrowSearchClock}{"\n\t"}{t.rememberFilter}
              </em>
              <br />
              <em>
                {t.combineSearch}{"\n"}
                {t.searchEvents}
              </em>
            </p>
          </li>
        </ul>

        <h2>{t.creatingOwnEvents}</h2>
        <ol>
          <li>{t.enterEventAndSport}</li>
          <li>
            {t.selectEventDateTime}
          </li>
          <li>{t.locationOnMap}</li>
          <li>{t.setParticipants}</li>
          <li>{t.writeDescription}</li>
          <li>{t.pressToAddEvent}</li>
        </ol>

        <h2>{t.ownInfo}</h2>
        <ul>
          <li>{t.editOwnInfo}</li>
          <li>{t.deleteAccount}</li>
        </ul>

        <h2>{t.contactInformation}</h2>
        <ul>
          <li>{t.contactUsInfo}</li>
          <li>{t.termsOfUseFooter}</li>
          <li>{t.changeLanguage}</li>
        </ul>
        <br />
        {t.info_txt}
      </div>
    </div>
  )
}

export default Info
