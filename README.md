# Vue Google Places Autocomplete

## Install

```js
import VueGooglePlaces from 'vue-google-places'
Vue.use(VueGooglePlaces)
```

>This module will load all needed google librarys automatically at first usage

## Use

```vue
  <VuetifyGooglePlaces
    :api-key="apiKey"
    class="subheading"
    :enable-geolocation="true"
    types="(cities)"
    country="ua"
    :value="place && place.name"
    placeholder="Places"
    @placechanged="getAddressData"
  />
```
## Other frameworks
  This component implemented in this frameworks:
  - Vuetify:
```js
  import { VuetifyGooglePlaces } from 'vue-google-places'
```

```vue
  <VuetifyGooglePlaces
    :api-key="apiKey"
    types="(cities)"
    country="us"
    placeholder="Input your place"
    @placechanged="onPlaceChanged"
  />
```
> To implement this module in other framework - welcome to contribute! Please use VuetifyGooglePlaces as template

## Props

 - apiKey: Google api key
 - enableGeolocation: component will ask user geolocation
 - enableGeocode: conponent will automatically find user place by his geolocation. This depends of `enableGeolocation` property
 - version: version of google maps api
 - types: String, Array. Supported user types [See google docs (Table 3)](https://developers.google.com/places/supported_types)
    - geocode
    - address
    - establishment
    - (regions)
    - (cities)


### Implementation with own input component

To use with own input component use default slot. VueGooglePlaces will automatically find html input element
```js
  import { VueGooglePlaces } from 'vue-google-places'
```
```vue
  <VueGooglePlaces
    :api-key="apiKey"
    class="subheading"
    :enable-geolocation="true"
    types="(cities)"
    country="us"
    @placechanged="getAddressData"
    <MyInput
      icon="search"
      :value="value"
      :placeholder="$t('Your place')"
      ...
    />
  </VueGooglePlaces>
```