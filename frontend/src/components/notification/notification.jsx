import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { removeNotification } from "../../store/notificationSlice"

// eslint-disable-next-line react/prop-types
const Notification = ({ id, message, type, duration }) => {
  const dispatch = useDispatch()
  const delay = duration ? duration : 4000 // default kesto on 4000

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeNotification(id))
    }, delay)

    return () => clearTimeout(timer)
  }, [id, dispatch, delay])

  return <div className={`notification ${type}`}>{message}</div>
}

export default Notification
