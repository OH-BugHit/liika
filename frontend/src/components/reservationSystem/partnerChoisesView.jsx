
import Footer from "../footer"
import Header from "../header"
import NotificationContainer from "../notification/notificationContainer"
import PartnerChoises from './partnerChoises'

const PartnerChoisesView = () => {

    return (
        <div
            className="fullpage"
            style={{
                backgroundImage: "url('/background-logandreg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <Header />
            <NotificationContainer />
            <PartnerChoises />
            <Footer />
        </div>
    )
}


export default PartnerChoisesView