[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Issues](https://img.shields.io/codeclimate/issues/github/me-and/mdf.svg)](#issues)

# Vue Multilanguage Label Store
> A Vue component that makes it easy to manage multilanguage translations in a store and access them trough a filter.

This plugin is used to provide a [Vue](https://vuejs.org/) app to handle multiple languages. Therefore it administrate a so called _label-store_. Each text snippet of text, no mind if it is just a button span description or a complete article, will be represent by such a [label](#labels). It define the same text in different languages. Depending on the selected language the label change its displayed content. This is simply provided by a _Vue_ filter, that can be used anywhere. Furthermore the selected language is stored locally into the web browsers persistent domain storage, so a user don't have to reselect the language when revisit or reload the page.

## Installation
```js
npm install weilbith/vue-multilang-store
```

### Module
```js
import Vue from 'vue'
import VueMultilangStore from 'vue-multilang-store'

Vue.add(VueMultilangStore, {options})
```

The plugin do not register itself to _Vue_, cause it require a configuration by the `options` object.

---


## Configuration
### Language List
The language list a mandatory property of the plugins options object. It defines all available available languages, the app should support. Independently how the language selection is presented to the user, the list should consists of unique _String_ entries, used as their associated keys. The list is not allowed to be empty.  At least it is not possible to edit this list during runtime.<br>
The list can be defined in two different ways. Either use an _Array_ or an _Object_. The second case is kinda special and gets its example [here](#labels), where the languages are define in a separate file.

```js
Vue.use(LabelStore, {
  languageList: ['en', 'de']
})
```

### Default Language
The default language is an central feature of this plugin. When ever a label lacks of translation for the currently active language, the snippet for the default language will be shown. At least it is the language the store use on initial state.<br>
It is important, that when defining an label, the default language gets a translation. Else an error will be thrown and your application do not came up.<br>
If no default language is specified, the first entry of the [language list](#language-list) is taken. By this it is an optional property.

```js
Vue.use(LabelStore, {
  defaultLanguage: 'en'
})
```

### Label Keys
A list of all available keys, which are used to access the labels. It is represented as an object, where the properties are the representative for each label and the values are the key of the label, used to access them for a translation. 

```js
Vue.use(LabelStore, {
  labelKeys: {
    cookie: 'cookie',
    confirm: 'confirm'
  }
})
```

By using a [mixin](https://vuejs.org/v2/guide/mixins.html), this list is available for every _Vue_ component, trough its data object as shown [here](#usage). Furthmore this is absolutely required to get the rerendering live, without have to reload the page itself (what also works, cause the persistency).


### Labels
The definition of an label consists of two parts. First the identifier or key, to access that that label. Followed by a list of translations for the same text (associated with this label) in different languages. It do not have to contain a translation for all languages, if at least one for the [default language](#default-language) is defined. This is especially usable for snippets, which are universal or at least equal between a set of languages.<br>
Labels can be defined at the options object for this plugin, but can be also [add](#add-label) dynamically during runtime.<br> 
This list of labels can be written in two different ways. Either use an _Array_ or an complex _Object_. Within the _Array_ the indices of the translations correlate to these in the [language list](#language-list). The advantage of the first approach is a more compressed notation. Unfortunately it is only possible to skip translations of languages which are defined at the end of the [languagel list](#language-list). To pass the requirements, at least all translations till the index of the default language have to be defined. By this it isn't a bad idea to put this on the beginning of the list. Remind that not define a default language manuannly, the first [language list](#language-list) entry will be used anyway.

```js
Vue.use(LabelStore, {
  languages: ['en', 'de'],
  defaultLanguage: 'en',
  labels: {
    cookie: ['cookie', 'Keks'],
    confirm: ['OK']
  }
})
```

An _Object_ is quite more extensive to use, but provide more flexibility. The keys are related to the language identifier and their values are the translation to this specific language. Providing a translation for just a selection of languages is independent from the [language list](#language-list). In the end, also the _Array_ notion will be transformed into such an _Object_. Missing translations will not be fulfilled here, so no unnecessary storage is allocated. 

```js
Vue.use(LabelStore, {
  languages: ['en', 'de'],
  defaultLanguage: 'en',
  labels: {
    cookie: {
      en: 'cookie',
      de: 'Keks'
    },
    confirm: {
      en: 'OK'
    }
  }
})
```

A mixed version works as well. It could be always used the notation that fits better for the respective label. 

It is commonly used to define the languages, keys and labels in external files to share them about modules or rather for a more clearly structure. This could look like the following.

_Languages.js_
```js
export const EN = 'en'
export const DE = 'de'
```

_LabelKeys.js_
```js
export const COOKIE = '2dccd1ab3e03990aea77359831c85ca2'
export const CONFIRM = 'd0cf705f201ddc526f49ba2e62392e21'
```

_Labels.js_
```js
import * as langs from './Languages'
import * as keys from './LabelKeys'

export default {
  [keys.COOKIE]: {
    [langs.EN]: 'cookie',
    [langs.DE]: 'Keks'
  },
  [keys.CONFIRM]: ['OK']
}
```

_main.js_
```js
import * as langs from './store/Languages'
import * as keys from './store/LabelKeys'
import labels from './store/Labels'

Vue.use(LabelStore, {
  languageList: langs, // cause object notation to use
  defaultLanguage: langs.EN,
  labelKeys: keys,
  labels: labels
})
```

**Attention:**<br>
Using the same label key twice, cause the second translation list to overwrite the first one. The plugin do not care about such issue, cause it is more likely a feature, exploit [here](#add-label). 

---


## Usage
### Functions
The function, provided by this plugin are properties of the global _Vue_ prototype object `$LabelStore`.

#### Set Language
Used to switch between the languages. It can be changed due to a dropdown menu for example or automatically by parse the users client properties. Automatically a change affects all labels in the app and show the translations for the choosen language. 

```html
<template>
  <div id="languageSelector">
    <select title="LanguageSelection">
      <template v-for="l in list">
        <option @click="setLanguage(l)"
                :selected="l === selected">
          {{ l }}
        </option>
      </template>
    </select>
  </div>
</template>
```
```js
<script>
  // Import enums.
  import * as langs from '../enums/Languages'

  export default {
    name: 'language-selector',

    data: function () {
      return {
        list: [], // The presentative label for each language.
        selected: '' // The presentative label of the selected language (part of the list).
      }
    },

    methods: {
      setLanguage: function (l) {
        this.$labelStore.setLanguage(langs[l])
      }
    },

    created: function () {
      // Get the initial selected language.
      const current = this.$labelStore.getLanguage()

      // Fill listwith the representative labels of each language.
      for (let l in langs) {
        this.list.push(l)

        // Check and set if it is the selected language.
        if (langs[l] === current) {
          this.selected = l
        }
      }
    }
  }
</script>
```

#### Get Language
The function is available anywhere by `this.$labelStore.getLanguage()`, which just return the _String_ of the current active language identifier. There are no further instructions necessary. 

#### Add Label
Labels could not only be defined by the options to the plugin, but also trough a function during runtime. It is similar in all requirements to the definition in the configurations. It can be just added one label at once, providing the key and the translation list. As mentioned at the [configuration section for label](#lables), using the same label key twice, will overwrite the translations. This could be used to dynamically change labels. Of cause it's main feature is to flexible add new labels to the store, while the application is already running. In combination with computed label keys for the filter, it is a powerful feature. 

```js
<script>
  export default {
    methods: {
      moreLabels () {
        this.$labelStore.addLabel('22af645d1859cb5ca6da0c484f1f37ea', ['new', 'neu'])
        
      }
    }
  }
</script>
```

#### Get Translation
The function `this.$labelStore.getTranslation` is a more less used way to access the translation of an label. Also if it more likely to use [filters](#filter), it has its use cases.<br>
In fact it just take a single argument, which specify the labels key value. In return the translation in relation to the currenlty selected language will be returned.

```js
<script>
  default {
    computed: {
      myLabel () {
        return this.$labelStore.translate(this.labels.COOKIE)
      }
    }
  }
</script>
```

---


### Filter
When the store is successfully configured, a label is accessible trough a _Vue_ filter called **translate**. It works like any other filter and can be used on any place.<br>
It takes the key of a label as value and choose the correct translation by the currently active language. The filter makes sure, to take the default language translation is used for labels, which have no such provided for the active language. If no label is defined for this key, an empty _String_ will be returned.<br>
Furthermore it is possible to provide optional `after` and `before` arguments. They are added dynamically before or after the translation text and are separated with a whitespace from the translation.

The following non-sense component demonstrate the flexible usage. At least it should not be a guide how to use filters in _Vue_.

```html
<template>  
  <!-- mustache template with mixin data key -->
  <p>{{ labels.COOKIE | translate }}</p>

  <!-- label key reference to enumeration -->
  <button @click="toggleStatus">{{ status | translate }}</button>

  <!-- use the after argument -->
  <span>{{ selectionHeader | translate(` - ${selection}`) }}</span>
</template>
```
```js
export default {
  data () {
    return {
      final: false,
      selection: 'chocolate'
    }
  },

  computed: {
    status () {
      if (this.final) {
        return this.labels.COOKIE
      } else {
        return this.11labels.CONFIRM
      }
    }
  }
}
```
