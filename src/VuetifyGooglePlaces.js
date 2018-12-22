import VueGooglePlaces from './VueGooglePlaces'

export default {
  props: {
    value: String,
    searchIcon: {
      type: String,
      default: () => 'search'
    },
    clearIcon: {
      type: String,
      default: () => 'close'
    }
  },
  data () {
    return {
      val: this.value,
      place: null
    }
  },
  computed: {
    getAppendIcon () {
      return this.place ? this.clearIcon : this.searchIcon
    }
  },
  watch: {
    value (value) {
      this.val = value
    }
  },
  methods: {
    renderInput () {
      return this.$createElement('VTextField', {
        attrs: this.$attrs,
        on: {
          'click:append': () => {
            this.$refs.gp.changePlace(null)
          }
        },
        props: {
          appendIcon: this.getAppendIcon,
          value: this.val
        }
      })
    }
  },
  render (h) {
    return h(VueGooglePlaces, {
      ref: 'gp',
      attrs: this.$attrs,
      on: {
        placechanged: (place) => {
          this.place = place
          this.$emit('placechanged', place)
        },
        input: (value) => {
          this.val = value
          this.$emit('input', value)
        }
      }
    }, [
      this.renderInput()
    ])
  }
}
