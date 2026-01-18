import { Route, Routes } from "react-router-dom"
import Frontpage from "./components/frontpageVIew/frontpage"
import Register from "./components/registerView"
import Login from "./components/loginView"
import MapView from "./components/mapView"
import TermsOfServiceView from "./components/termsOfServiceView"
import InfoView from "./components/infoView"
import CreateEventView from "./components/createEventView"
import EventView from "./components/eventView"
import AccountView from "./components/accountView"
import ChangeEmail from "./components/accountView/changeInfo/changeEmail"
import ChangeUsername from "./components/accountView/changeInfo/changeUsername"
import JoinedView from "./components/joinedListView"
import ChangePassword from "./components/accountView/changeInfo/changePassword"
import CreatedEvents from "./components/createdEventsView"
import ModifyEvent from "./components/modifyEventView"
import ChangeLanguage from "./components/accountView/changeInfo/changeLanguage"
import ChangeMap from "./components/accountView/changeInfo/changeMap"
import AboutView from './components/aboutView'
import PrivacyStatementView from './components/privacyStatementView'
import PartnerChoisesView from './components/reservationSystem/partnerChoisesView'
import ModifyReservationSystemView from './components/reservationSystem/modifyReservationSystem'
import ListReservationSystems from './components/reservationSystem/listReservationSystems'
import ModifyFieldView from './components/reservationSystem/modifyField'
import ReservationSystemView from './components/reservationSystem'
import CreateReservationSystem from './components/reservationSystem/createReservationSystem'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Frontpage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/map" element={<MapView />} />
      <Route path="/termsOfService" element={<TermsOfServiceView />} />
      <Route path="/info" element={<InfoView />} />
      <Route path="/create_event" element={<CreateEventView />} />
      <Route path="/own_info" element={<AccountView />} />
      <Route path="/events/:id" element={<EventView />} />
      <Route path="/own_info/email" element={<ChangeEmail />} />
      <Route path="/own_info/username" element={<ChangeUsername />} />
      <Route path="/joined_events" element={<JoinedView />} />
      <Route path="/own_info/password" element={<ChangePassword />} />
      <Route path="/created_events" element={<CreatedEvents />} />
      <Route path="/events/own/:id" element={<ModifyEvent />} />
      <Route path="/own_info/language" element={<ChangeLanguage />} />
      <Route path="/own_info/map" element={<ChangeMap />} />
      <Route
        path="/partner/create_club_event"
        element={<CreateEventView club={true} />}
      />
      <Route
        path="/partner/create_reservation_system"
        element={<CreateReservationSystem />}
      />
      <Route path="/partner/modify/system/:id" element={<ModifyReservationSystemView />} />
      <Route path="/partner/modify/field/:id" element={<ModifyFieldView />} />
      <Route path='/partner/list_reservation_systems' element={<ListReservationSystems />} />
      <Route path='/partner' element={<PartnerChoisesView />} />
      <Route path='/reservation_system/:id' element={<ReservationSystemView />} />
      <Route path='/us' element={<AboutView />} />
      <Route path='/privacy' element={<PrivacyStatementView />} />
    </Routes>
  )
}

export default App
