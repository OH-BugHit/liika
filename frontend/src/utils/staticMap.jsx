import { useEffect } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "../index.css"
import { LiikaOverlay } from '../components/mapView/layers/overlayLayers'

// eslint-disable-next-line react/prop-types
const StaticMap = ({ mapCenter }) => {
  const liikaLayer = new LiikaOverlay()
  useEffect(() => {
    // Luo karttaelementti kun komponentti mounttaa
    // Tarkastetaan ensin, että kartalla on aloitussijainti:
    if (!mapCenter[0] || !mapCenter[1]) {
      console.log("Ei aloituskordinaatteja..\nAsetetaan defaultit")
      mapCenter = [29.7639, 62.6013]
    }

    // Lisää OpenStreetMap-laatta
    var osm = L.tileLayer(
      "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    )

    const map = L.map("map", {
      center: [mapCenter[1], mapCenter[0]],
      zoom: 15,
      layers: [osm, liikaLayer],
    })


    // Luo marker, joka asetetaan kartan keskelle
    L.marker(map.getCenter(), {
      icon: L.icon({
        iconUrl: "/items.png", // Varmista, että kuva löytyy public-kansiosta
        iconSize: [64, 64],
        iconAnchor: [32, 62],
      }),
    }).addTo(map)

    // Päivittää markerin sijainnin aina, kun karttaa siirretään

    return () => {
      map.off("move")
      map.remove()
    }
  }, [])

  return (
    <div
      id="map"
      className="map-location-setter"
      style={{ minHeight: "40vh", flex: "1" }}
    ></div>
  )
}

export default StaticMap
