import { configureStore } from "@reduxjs/toolkit"
import languageReducer from "./languageSlice"
import locationReducer from "./locationSlice"
import categoriesReducer from "./categoriesSlice"
import userReducer from "./userSlice"
import eventReducer from "./eventSlice"
import notificationReducer from "./notificationSlice"
import deviceSettingsReducer from "./deviceSettingsSlice"

export const store = configureStore({
  reducer: {
    language: languageReducer,
    location: locationReducer,
    categories: categoriesReducer,
    user: userReducer,
    event: eventReducer,
    notifications: notificationReducer,
    deviceSettings: deviceSettingsReducer,
  },
})
//Notifikaatioiden testiin (poista kun löydät)
window.store = store

export default store
