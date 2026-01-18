import { useDispatch, useSelector } from "react-redux"
import Select from "react-select"
import { changeLanguage } from "../store/languageSlice"

// eslint-disable-next-line react/prop-types
const FlagSelection = ({ menuPlacement }) => {
  const dispatch = useDispatch()
  const selectedLanguage = useSelector((state) => state.language.language)

  const options = [
    { value: "FI", label: "Suomi" },
    { value: "EN", label: "English" },
    //Lisätään muita kieliä tarvittaessa
  ]

  const handleChange = (selectedOption) => {
    dispatch(changeLanguage(selectedOption.value))
  }

  const selectedOption = options.find(
    (option) => option.value === selectedLanguage
  )

  return (
    <div>
      <Select
        menuPlacement={menuPlacement}
        value={selectedOption}
        onChange={handleChange}
        options={options}
      />
    </div>
  )
}

export default FlagSelection
