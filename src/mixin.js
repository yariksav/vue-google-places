import VueGooglePlaces from './VueGooglePlaces'

export default {
  props: {
    value: String,
  },
  data () {
    return {
      val: this.value,
      place: null
    }
  },
  watch: {
    value (value) {
      this.val = value
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
