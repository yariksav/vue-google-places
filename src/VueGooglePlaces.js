
import loadJS from 'load-js'

let loadModulePromise
const loadModule = (options) => {
  if (Object.prototype.hasOwnProperty.call(window, 'google')) {
    return Promise.resolve()
  }
  const opt = Object.assign({
    libraries: 'places'
  }, options)
  const parameters = Object.keys(opt)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(opt[key])}`)
    .join('&')
  let url = `https://maps.googleapis.com/maps/api/js?${parameters}`
  return loadJS(url).catch(e => {
    loadModulePromise = null
    console.warn('Error loading google maps script', e)
  })
}

export default {
  props: {
    apiKey: String,
    country: String,
    enableGeolocation: Boolean,
    enableGeocode: Boolean,
    value: String,
    version: String,
    types: [String, Array],
    addressFields: Object
  },
  data () {
    return {
      geolocateSet: false,
      prepared: false,
      textValue: '',
      currentPlace: null,
      enterPressListener: null,
      hasDownBeenPressed: false
    }
  },
  computed: {
    getAppendIcon () {
      return this.currentPlace ? 'close' : this.appendIcon
    }
  },
  watch: {
    country (newVal) {
      if (newVal && this.autocomplete) {
        this.autocomplete.componentRestrictions.country = newVal
      }
    },

    types (newVal) {
      if (newVal) {
        const types = Array.isArray(newVal) ? newVal : [newVal]
        this.autocomplete.setTypes(types)
      }
    }
  },
  created () {
    // STUB for vue2-google-maps and vue-google-places work together
    // TODO chanhe this to @google/map module in future
    if (typeof this.$gmapApiPromiseLazy === 'function') {
      loadModulePromise = this.$gmapApiPromiseLazy()
    } else {
      loadModulePromise = loadModulePromise || loadModule({
        key: this.apiKey,
        v: this.version
      })
    }
    this.parsedAddressFields = Object.assign({
      street_number: 'short_name',
      route: 'long_name',
      locality: 'long_name',
      administrative_area_level_1: 'short_name',
      administrative_area_level_2: 'short_name',
      administrative_area_level_3: 'short_name',
      postal_code: 'short_name'
    }, this.addressFields)
  },
  mounted () {
    loadModulePromise.then(() => {
      this.setupGoogle()
    })
  },
  methods: {
    enableEnterKey (input) {

      /* Store original event listener */
      const _addEventListener = input.addEventListener
  
      const addEventListenerWrapper = (type, listener) => {
        if (type === "keydown") {
          /* Store existing listener function */
          const _listener = listener
          listener = (event) => {
            /* Simulate a 'down arrow' keypress if no address has been selected */
            const suggestion_selected = document.getElementsByClassName('pac-item-selected').length > 0
            if (event.which === 13 && !suggestion_selected) {
              // let e = { keyCode: 40, which: 40 }
              // if (window.KeyboardEvent) {
              //   e = new window.KeyboardEvent('keydown', e)
              // }
              // _listener.apply(input, [e])
              const e = JSON.parse(JSON.stringify(event))
              e.which = 40
              e.keyCode = 40
              console.log('e', e)
              _listener.apply(input, [e])
            }
            _listener.apply(input, [event])
          }
        }
        _addEventListener.apply(input, [type, listener])
      }
  
      input.addEventListener = addEventListenerWrapper
    },
    setupInput () {
      this.element.addEventListener('keydown', (e) => {
        if (e.keyCode === 40) {
          this.hasDownBeenPressed = true;
        }
      })
    
      this.enterPressListener = window.google.maps.event.addDomListener(this.element, 'keydown', (e) => {
        e.cancelBubble = true;
        // If enter key, or tab key
        if (e.keyCode === 13 || e.keyCode === 9) {
          // If user isn't navigating using arrows and this hasn't ran yet
          if (!this.hasDownBeenPressed && !e.hasRanOnce) {
            let event = { keyCode: 40, hasRanOnce: true }
            if (window.KeyboardEvent) {
              event = new window.KeyboardEvent('keydown', event)
            }
            google.maps.event.trigger(e.target, 'keydown', event)
          }
        }
      })

      this.element.addEventListener('focus', () => {
        this.hasDownBeenPressed = false
      })
    },
    setupGoogle () {
      const options = {}

      if (typeof this.types === 'string') {
        options.types = [this.types]
      } else if (Array.isArray(this.types)) {
        options.types = this.types
      }

      if (this.country) {
        options.componentRestrictions = {
          country: this.country
        }
      }

      this.element = this.$el
      // this.element = this.$refs.input.$el || this.$refs.input
      if (this.element.tagName !== 'INPUT') {
        this.element = this.element.querySelector('input')
      }
      if (!this.element) {
        console.warn('Input element was not found in ' + this.component)
        return
      }
      this.autocomplete = new window.google.maps.places.Autocomplete(
        this.element,
        options
      )
      // this.enableEnterKey(this.element)
      this.setupInput()

      this.autocomplete.addListener('place_changed', this.onPlaceChange)
      this.geocoder = new window.google.maps.Geocoder()
      this.geolocate()
    },
    parsePlace (place) {
      const returnData = {}

      if (place.formatted_address !== undefined) {
        this.textValue = place.formatted_address
        // document.getElementById(this.id).value = place.formatted_address
      }

      if (place.address_components !== undefined) {
        // Get each component of the address from the place details
        for (let i = 0; i < place.address_components.length; i += 1) {
          const addressType = place.address_components[i].types[0]

          if (this.parsedAddressFields[addressType]) {
            const val = place.address_components[i][this.parsedAddressFields[addressType]]
            returnData[addressType] = val
          }
          if (addressType === 'country') {
            returnData.country = place.address_components[i]['long_name']
            returnData.country_code = place.address_components[i]['short_name']
          }
        }

        returnData.latitude = place.geometry.location.lat()
        returnData.longitude = place.geometry.location.lng()

        // additional fields available in google places results
        returnData.name = place.name
        returnData.formatted_address = place.formatted_address
        returnData.photos = place.photos
        returnData.place_id = place.place_id
        returnData.place = place
      }
      return returnData
    },
    changePlace (place) {
      this.$emit('placechanged', place)
      this.textValue = place ? this.textValue : ''
      this.$emit('input', this.textValue)
      this.currentPlace = place
    },
    onPlaceChange () {
      this.hasDownBeenPressed = false
      const place = this.autocomplete.getPlace()

      if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        this.$emit('noresult', place)
        return
      }

      const pl = this.parsePlace(place)
      this.changePlace(pl)
    },
    geolocate () {
      if (this.enableGeolocation && !this.geolocateSet) {
        if (!navigator.geolocation) {
          return
        }
        navigator.geolocation.getCurrentPosition((position) => {
          const geolocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          const circle = new window.google.maps.Circle({
            center: geolocation,
            radius: position.coords.accuracy
          })
          if (this.enableGeocode) {
            this.geocoder.geocode({ 'location': geolocation }, (results, status) => {
              if (status === 'OK' && results.length) {
                this.textValue = results[1].formatted_address
                const pl = this.parsePlace(results[1])
                this.changePlace(pl)
              }
            })
          }
          this.autocomplete.setBounds(circle.getBounds())
          this.geolocateSet = true
        })
      }
    },
    renderInput (h) {
      return h('input', {
        attrs: {
          type: 'text',
          class: 'v-google-places__input',
          value: this.textValue,
          ...this.$attrs
        }
      })
    }
  },
  render (h) {
    const inputNode = this.$slots.default || [this.renderInput(h)]
    return h('div', {
      class: 'v-google-places'
    }, inputNode)
  },
  beforeDestroy () {
    if (this.enterPressListener) {
      window.google.maps.event.removeListener(this.enterPressListener)
    }
  }
}
