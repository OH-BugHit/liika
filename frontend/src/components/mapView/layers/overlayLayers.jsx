import L from "leaflet"

const createCustomOverlay = (className, mapPreferences) =>
  L.Layer.extend({
    onAdd(map) {
      this._div = L.DomUtil.create("div", className)
      if (mapPreferences) {
        // Käytetään mapPreferences-tyylejä overlayn luomisessa
        const userStyle = {
          backdropFilter: `saturate(${mapPreferences.saturate}%) brightness(${mapPreferences.brightness}%) contrast(${mapPreferences.contrast}%) hue-rotate(${mapPreferences.hue}deg) invert(${mapPreferences.invert}%) sepia(${mapPreferences.sepia}%)`,
          backgroundColor: `rgba(${mapPreferences.r}, ${mapPreferences.g}, ${
            mapPreferences.b
          }, ${mapPreferences.a * 0.01})`,
        }
        Object.assign(this._div.style, userStyle)
      }

      map.getPanes().overlayPane.appendChild(this._div)

      // Päivitä overlayn sijainti kartan mukana
      this._updatePosition(map)
      map.on("move", this._onMapMove, this)
    },

    onRemove(map) {
      if (this._div) {
        map.getPanes().overlayPane.removeChild(this._div)
      }
      map.off("move", this._onMapMove, this)
    },

    _onMapMove() {
      this._updatePosition(this._map)
    },

    _updatePosition(map) {
      const center = map.latLngToLayerPoint(map.getCenter())
      L.DomUtil.setPosition(this._div, center)
    },
  })

// Luo kolme erilaista overlayta
export const LiikaOverlay = createCustomOverlay("liika-layer")
export const DarkOverlay = createCustomOverlay("dark-layer")
class UserOverlay extends L.Layer {
  constructor(mapPreferences) {
    super() // Kutsu L.Layerin konstruktorin
    this.mapPreferences = mapPreferences // Tallenna mapPreferences
  }

  onAdd(map) {
    this._div = L.DomUtil.create("div", "user-layer")

    if (this.mapPreferences) {
      const userStyle = {
        backdropFilter: `saturate(${this.mapPreferences.saturate}%) brightness(${this.mapPreferences.brightness}%) contrast(${this.mapPreferences.contrast}%) hue-rotate(${this.mapPreferences.hue}deg) invert(${this.mapPreferences.invert}%) sepia(${this.mapPreferences.sepia}%)`,
        backgroundColor: `rgba(${this.mapPreferences.r}, ${
          this.mapPreferences.g
        }, ${this.mapPreferences.b}, ${this.mapPreferences.a * 0.01})`,
      }
      Object.assign(this._div.style, userStyle)
    }

    map.getPanes().overlayPane.appendChild(this._div)
    this._updatePosition(map)

    map.on("move", this._onMapMove, this)
  }

  onRemove(map) {
    if (this._div) {
      map.getPanes().overlayPane.removeChild(this._div)
    }
    map.off("move", this._onMapMove, this)
  }

  _onMapMove() {
    this._updatePosition(this._map)
  }

  _updatePosition(map) {
    const center = map.latLngToLayerPoint(map.getCenter())
    L.DomUtil.setPosition(this._div, center)
  }
}

export { UserOverlay }
