import Vue from 'vue'

/* Properties */
// The list of all available languages.
let languageList = []

// The default language to use on initial state. 
let defaultLanguage = null

// The currently active language.
let activeLanguage = null

// The object that holds all lables with their translations.
let labels = {}

// Object with all label keys, used to provide it to each component.
let labelKeys = {}


/**
 * Function to add a new label to the store.
 * The label is accessable by the given key.
 * Call this method twice with the same key, the second call will overwrite the first one.
 * The label has a list of translations for the different languages.
 * The translations could be defined as an Object or Array.
 * It is not necessary to provide a translation for all languages, if at least the default one is defined.
 * In Object notation, it is expected, that the keys are the languages, the String value is the translation for.
 * Providing translations for not registered languages are ignored.
 * In Array notation, the String entries as translations will be assigned to the languages in the same order,
 * as the language list in the options was.
 * Translations are not allowed to be an empty String at all.
 *
 * @param   {String} key
 *          The key, by this the label should be accessable.
 *
 * @param   {Object|Array} translation
 *          The translations for this label in different languages,
 *
 */
const addLabel = (key, translation) => {
  // Make sure to have valud key.
  if (typeof key !== 'string' || key.length <= 0) {
    throw new Error('The key of a translation has to be non-empty String!')
  }

  // The list with all translations of this translation.
  const translationList = {}

  // Handle array notation.
  if (Array.isArray(translation)) {
    // Make sure a translation for the default language is defined.
    if (!translation[languageList.indexOf(defaultLanguage)]) {
      throw new Error('Missing default language translation for translation "' + key + '".')
    }

    for (let i = 0; i < translation.length; i++) {
      // Make sure the translation is a non-empty String.
      if (typeof translation[i] !== 'string' ||translation[i].length <= 0) {
        throw new Error('Missing default language translation for the translation "' + key + '".')
      }
      
      // Add translation.
      translationList[languageList[i]] = translation[i]
    }
  } else {
  // Handle the object notation.
    // Make sure a translation for the default language is defined.
    if (!translation[defaultLanguage]) {
      throw new Error('Missing default language translation for translation "' + key + '".')
    }

    // Iterate over languages and search for their translation etries in the translation.
    for (let lang in translation) {
      if (!languageList.includes(lang)) {
        console.warn('Undefined language "' + lang + '" for the translation "' + key + '".')
      } else {
        // Make sure the translation is a non-empty String.
          if (typeof translation[lang] !== 'string' || translation[lang].length <= 0) {
            throw new Error('An translation translation is expected as a non-empty String! (Label "' + key + '")')
          }

        // Add translation.
        translationList[lang] = translation[lang]
      }
    }
  }

  // Add the label with the key to the store.
  labels[key] = translationList
}

/**
 * Method to get the translation of an label by its key.
 * Return the translation by the currently active language.
 *
 * @param   {String} key
 *          The key of the label to get translation for.
 *
 * @param   {String} lang
 *          The language the label should be translated to.
 *
 *
 * @param   {String} translation
 *          The translation corresponding to the active language.
 */
const getTranslation = (key, lang) => {
  // Check if a label with this key exists.
  if (labels[key]) {
    if (labels[key][lang]) {
      // Return translation for the active language.
      return labels[key][lang]
    } else {
      // Return the default language translations.
      return labels[key][lang]
    }
  } else {
    // Label is not defined.
    return ''
  }
}


function writeLanguageToLocalStorage () {
  // Store the active language.
  localStorage.language = activeLanguage
}

function readLanguageFromLocalStorage () {
  // Is null if no language has been defined.
  return localStorage.language
}


/* The Plugin */
const Store = {

  install: function (Vue, options) {

    /*
     * Options
     */

    // Make sure that any options has been provided.
    if (!options) {
      throw new Error('Missing options!')
    }
      
    /* Language List */
    // Do a few sanitiy checks to the language list.
    // Make sure a language list is defined.
    if (!options.languageList) {
      throw new Error('Missing language list!')
    }

    // Handle array notation.
    if (Array.isArray(options.languageList)) {
      // Check each entry.
      options.languageList.forEach(lang => {
        if (typeof lang !== 'string' || lang.length <= 0) {
          throw new Error('An language list entry is expected to be a non-empty String!')
        }

        // Every thing is fine.
        languageList = options.languageList
      }) 
    } else {
      // Handle object notation.
      for (let lang in options.languageList) {
        if (typeof options.languageList[lang] !== 'string' || options.languageList[lang].length <= 0) {
          throw new Error('An language list entry is expected to be a non-empty String!')
        }

        languageList.push(options.languageList[lang])
      }
    }

    /* Default Language */
    if (options.defaultLanguage) {
      // Make sure the default language exist.
      if (!languageList.includes(options.defaultLanguage)) {
        throw new Error('Defined default language is not part of the language list!')
      } 
      
      // No further checks necessary, cause the rest is handled by the 'includes' call.
      defaultLanguage = options.defaultLanguage
    } else {
      // Use the first language from the list as default.
      // At least one entry have to exist, cause the previous checks.
      defaultLanguage = languageList[0]
    }

    // Set the active language.
    const storedLanguage = readLanguageFromLocalStorage()
    activeLanguage = storedLanguage ? storedLanguage : defaultLanguage
    writeLanguageToLocalStorage()


    /* Labels */
    if (options.labels) {
      // Add each entry.
      for (let key in options.labels) {
        addLabel(key, options.labels[key])
      }
    }

    /* Label Keys */
    if (options.labelKeys) {
      labelKeys = options.labelKeys
    }


    // Create a global even bus.
    window.languageEventBus = new Vue()


    /*
     * Functions
     */

    // Initialize empty object to be able to add functions to it later on.
    Vue.prototype.$labelStore = {}

    // Show description on the actual function.
    Vue.prototype.$labelStore.addLabel = addLabel

    /**
     * Function to get the currently active language.
     *
     * @return  {String} lang
     *          The currently active language.
     */
    Vue.prototype.$labelStore.getLanguage = () => {
      return activeLanguage
    }


    /**
     * Function to set the active language.
     * Have to be a language from the list set by the options.
     *
     * @param   {String} lang
     *          The language to set as active.
     */
    Vue.prototype.$labelStore.setLanguage = (lang) => {
      if (!languageList.includes(lang)) {
        throw new Error('The active language could only be set one defined in the option list!')
      }

      // Set the active language and write to the local storage.
      activeLanguage = lang
      writeLanguageToLocalStorage()

      // Emit the event, that a new language has been set and rerendering is required.
      window.languageEventBus.$emit('changeLanguage')
    }

    /**
     * Provide the translate function directly besides to the filter.
     * For a further description see the function 'getTranslation'.
     */
    Vue.prototype.$labelStore.translate = key => {
      return getTranslation(key, activeLanguage)
    }



    /**
     * Filter
     */

    /**
     * Global filter function to translate a label.
     * It maps the key of a label to its translation in relation to the active language.
     * Support adding a String before and after the translation.
     *
     * @param   {String} key
     *          The key of the label to get translation for.
     *
     * @param   {String} after
     *          Optionally add some text behind the translation.
     *          Add automatically a space character before.
     *
     * @param   {String} before
     *          Optionally add some text before the translation.
     *          Add automatically a space character after.
     *
     *
     * @return  {String}
     *          Concatenation of the before and after argument(s) and the translation of the label.
     */
    Vue.filter('translate', function (key, after = '', before = '') { 
      const extendAfter = after.length === 0 ? after : ` ${after}`
      const extendBefore = before.length === 0 ? before: `${before} `
      return `${extendBefore}${getTranslation(key, activeLanguage)}${extendAfter}`
    })


    /**
     * Mixin
     */

    /**
     * Distribute the label keys to all components.
     * Watch for the update event to start rerender.
     */
    Vue.mixin({
      data: function () {
        return {
          labels: labelKeys,
        }
      },

      created () {
        // Force a rerender of all translations by artificial reset the labels data object.
        window.languageEventBus.$on('changeLanguage', () => {
          this.labels = JSON.parse(JSON.stringify(this.labels))
        }) 
      }
    })
  }
}

export default Store
