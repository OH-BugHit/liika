import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  // Localstorage on string-muotoinen, siksi stringify ja parse
  user: JSON.parse(localStorage.getItem("user")) || null,
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    changeUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem("user", JSON.stringify(state.user))
    },
  },
})

export const { changeUser, loadUserFromStorage } = userSlice.actions
export default userSlice.reducer
