import { useDispatch, useSelector } from "react-redux"
import Notification from "./notification"
import { removeAllNotification } from "../../store/notificationSlice"

const NotificationContainer = () => {
  const dispatch = useDispatch()
  const handleOnClick = () => {
    dispatch(removeAllNotification())
  }
  const notifications = useSelector(
    (state) => state.notifications.notifications
  )

  return (
    <div className="notification-container" onClick={() => handleOnClick()}>
      {notifications.map((notification) => (
        <Notification key={notification.id} {...notification} />
      ))}
    </div>
  )
}

export default NotificationContainer
