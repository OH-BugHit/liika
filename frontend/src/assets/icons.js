import L from "leaflet"

const RESICONSIZE = [58, 58]
const RESICONANCHOR = [29, 29]
const ICONSIZE = [64, 64]
const ICONANCHOR = [32, 32]
const POPUPANCHOR = [0, -16]
const SHADOWSIZE = [80, 80]
const SHADOWICONANCHOR = [40, 40]

export const categoryMap = {
  1: "amerikkalainen_jalkapallo",
  2: "avantouinti",
  3: "biljardi",
  4: "golf",
  5: "jaakiekko",
  6: "jalkapallo",
  7: "juoksu",
  8: "keilaus",
  9: "koripallo",
  10: "lentopallo",
  11: "nyrkkeily",
  12: "padel",
  13: "pesapallo",
  14: "pingis",
  15: "puntti",
  16: "pyoraily",
  17: "sulkapallo",
  18: "tennis",
  19: "uinti",
  20: "pihapelit",
  21: "koiralenkki",
  22: "salibandy",
  23: "kiipeily",
  24: "frisbeegolf",
  25: "tanssi",
  26: "yleisurheilu",
}

export const selectIcon = (categoryID) => {
  const categoryMapping = categoryMap
  return Icongroup[categoryMapping[categoryID]] || null
}

export const selectSystemIcon = (categoryID) => {
  if (!categoryID) {
    const icon = L.icon({
      iconUrl: "/reservationSystemIcon.png", // Tulee olla public-kansiossa
      iconSize: RESICONSIZE, // Ikonin koko pixeleinä
      iconAnchor: RESICONANCHOR, // Minkä verran offsettiä painalluskohdasta
      popupAnchor: POPUPANCHOR, // -""- 
      shadowUrl: "/lajit/white_squircle2.png", // Varjon polku/lajit/white_squircle2.png"
      shadowSize: [66, 60], // Varjon koko
      shadowAnchor: [33, 30], // Varjon ankkuripiste
    })
    return icon
  } else {
    const categoryMapping = categoryMap
    const icon = Icongroup[categoryMapping[categoryID]] || null
    icon.options.shadowUrl = "/lajit/white_squircle2.png"
    icon.options.shadowSize = [60, 60]
    icon.options.shadowAnchor = [30, 30]
    return icon
  }
}

export const selectClubIcon = ({ clubName, categoryID }) => {
  // Täällä voidaan toteuttaa myös kategorian mukainen clubiikoni
  try { // Tarkistetaan onko clubilla omaa ikonia
    return ClubIconGroup[clubString(clubName)]
    // eslint-disable-next-line no-unused-vars
  } catch (e) { // Jos ei ollut niin annetaan kategorian mukainen ikoni
    const categoryMapping = categoryMap
    return Icongroup[categoryMapping[categoryID]] || null
  }
}

const clubString = (str) => {
  return str
    .toLowerCase()
    .replace(/\s/g, "_") // Korvaa välilyönnit "_"
    .replace(/ä/g, "a") // Korvaa "ä" → "a"
    .replace(/ö/g, "o") // Korvaa "ö" → "o"
    .replace(/å/g, "o") // Korvaa "å" → "o"
}
// Voidaan käyttää traslation hakemisessa. Translatios sisältää avaimet näillä kategorianimillä
export const selectCategoryName = (categoryID) => {
  return categoryMap[categoryID] || ""
}

const ClubIconGroup = {
  liika: L.icon({
    iconUrl: "/lajit/liika_logovanha.png", // Tulee olla public-kansiossa
    iconSize: ICONSIZE, // Ikonin koko pixeleinä
    iconAnchor: ICONANCHOR, // Minkä verran offsettiä painalluskohdasta
    popupAnchor: POPUPANCHOR, // -""-
    shadowUrl: "/lajit/yhteistyotausta.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  joensuun_pallopojat: L.icon({
    iconUrl: "/lajit/joensuun_pallopojat.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/yhteistyotausta.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  joensuun_jalkapalloseura: L.icon({
    iconUrl: "/lajit/liika_logovanha.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/yhteistyotausta.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),
}

const Icongroup = {
  amerikkalainen_jalkapallo: L.icon({
    iconUrl: "/lajit/amerikkalainen_jalkapallo.png", // Tulee olla public-kansiossa
    iconSize: ICONSIZE, // Ikonin koko pixeleinä
    iconAnchor: ICONANCHOR, // Minkä verran offsettiä painalluskohdasta
    popupAnchor: POPUPANCHOR, // -""-
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  avantouinti: L.icon({
    iconUrl: "/lajit/avantouinti.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  biljardi: L.icon({
    iconUrl: "/lajit/biljardi.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  frisbeegolf: L.icon({
    iconUrl: "/lajit/frisbeegolf.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  golf: L.icon({
    iconUrl: "/lajit/golf.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  jaakiekko: L.icon({
    iconUrl: "/lajit/jaakiekko.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  jalkapallo: L.icon({
    iconUrl: "/lajit/jalkapallo.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  juoksu: L.icon({
    iconUrl: "/lajit/juoksu.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  keilaus: L.icon({
    iconUrl: "/lajit/keilaus.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  kiipeily: L.icon({
    iconUrl: "/lajit/kiipeily.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  koiralenkki: L.icon({
    iconUrl: "/lajit/koiralenkki.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  koripallo: L.icon({
    iconUrl: "/lajit/koripallo.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  lentopallo: L.icon({
    iconUrl: "/lajit/lentopallo.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  nyrkkeily: L.icon({
    iconUrl: "/lajit/nyrkkeily.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  padel: L.icon({
    iconUrl: "/lajit/padel.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  pesapallo: L.icon({
    iconUrl: "/lajit/pesapallo.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  pihapelit: L.icon({
    iconUrl: "/lajit/pihapelit.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  pingis: L.icon({
    iconUrl: "/lajit/pingis.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  puntti: L.icon({
    iconUrl: "/lajit/puntti.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  pyoraily: L.icon({
    iconUrl: "/lajit/pyoraily.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  tanssi: L.icon({
    iconUrl: "/lajit/tanssi.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  salibandy: L.icon({
    iconUrl: "/lajit/salibandy.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),


  sulkapallo: L.icon({
    iconUrl: "/lajit/sulkapallo.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  tennis: L.icon({
    iconUrl: "/lajit/tennis.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  uinti: L.icon({
    iconUrl: "/lajit/uinti.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),

  yleisurheilu: L.icon({
    iconUrl: "/lajit/yleisurheilu.png",
    iconSize: ICONSIZE,
    iconAnchor: ICONANCHOR,
    popupAnchor: POPUPANCHOR,
    shadowUrl: "/lajit/white_shadow.png", // Varjon polku
    shadowSize: SHADOWSIZE, // Varjon koko
    shadowAnchor: SHADOWICONANCHOR, // Varjon ankkuripiste
  }),
}

export default { Icongroup, selectIcon }
