export const parseTimeAndDate = (isoDate) => {
  const date = new Date(isoDate)
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`
  const dateStr = `${String(date.getDate()).padStart(2, "0")}.${String(
    date.getMonth() + 1
  ).padStart(2, "0")}.${date.getFullYear()}`
  return [time, dateStr]
}

export const formatUrl = (url) => {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `https://${url}`
}

export const translateOn = (language) => {
  if (language === "EN") {
    return true
  }
  return false
}

export const translateLanguage = (language) => {
  switch (language) { // Lisää tänne kieliä kun niitä tulee valintoihin
    case "EN":
      return "en"
    default:
      return "en" // fallback
  }
}