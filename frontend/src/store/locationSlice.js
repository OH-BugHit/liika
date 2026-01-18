import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  // Localstorage on string-muotoinen, siksi stringify ja parse
  location: JSON.parse(localStorage.getItem("location")) || {
    o_lat: 62.6013,
    o_lng: 29.7639,
    lat: 62.6013,
    lng: 29.7639,
    zoom: 10,
  },
}

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    changeLocation: (state, action) => {
      state.location = action.payload
      localStorage.setItem("location", JSON.stringify(state.location))
    },
  },
})

export const { changeLocation } = locationSlice.actions
export default locationSlice.reducer
