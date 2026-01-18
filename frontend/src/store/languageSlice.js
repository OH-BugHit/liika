import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  language: localStorage.getItem("lang") || "FI",
}

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    changeLanguage: (state, action) => {
      state.language = action.payload
      localStorage.setItem("lang", state.language)
    },
  },
})

export const { changeLanguage } = languageSlice.actions
export default languageSlice.reducer
