import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  categories: JSON.parse(localStorage.getItem("categories")) || [],
}

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    changeCategories: (state, action) => {
      state.categories = action.payload
      localStorage.setItem("categories", JSON.stringify(state.categories))
    },
  },
})

export const { changeCategories } = categoriesSlice.actions
export default categoriesSlice.reducer
