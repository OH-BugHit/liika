import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    // Localstorage on string-muotoinen, siksi stringify ja parse
    deviceSettings: JSON.parse(localStorage.getItem("deviceSettings")) || null,
}

const deviceSettingsSlice = createSlice({
    name: "deviceSettings",
    initialState,
    reducers: {
        changeDeviceSettings: (state, action) => {
            state.deviceSettings = { ...state.deviceSettings, ...action.payload }
            localStorage.setItem("deviceSettings", JSON.stringify(state.deviceSettings))
        },
    },
})

export const { changeDeviceSettings } = deviceSettingsSlice.actions
export default deviceSettingsSlice.reducer
