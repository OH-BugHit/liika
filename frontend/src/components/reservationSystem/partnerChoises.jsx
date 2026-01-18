import "./partnerChoises.css"
import { Link } from 'react-router-dom'

const PartnerChoises = () => {

    return (
        <div className='partner-choises-view'>

            <Link to={"/partner/create_club_event"} className="link-btn">
                {"Luo yhteistyökumppanitapahtuma"}
            </Link>
            <Link to={"/partner/create_reservation_system"} className="link-btn">
                {"Luo kenttävarausjärjestelmä"}
            </Link>
            <Link to={"/partner/list_reservation_systems"} className="link-btn">
                {"Muokkaa kenttävarausjärjestelmää"}
            </Link>
        </div>
    )
}

export default PartnerChoises