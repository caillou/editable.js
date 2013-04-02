Editable.browserFeatures = (function () {

  /**
   * Check for contenteditable support
   *
   * (from Modernizr)
   * this is known to false positive in some mobile browsers
   * here is a whitelist of verified working browsers:
   * https://github.com/NielsLeenheer/html5test/blob/549f6eac866aa861d9649a0707ff2c0157895706/scripts/engine.js#L2083
   */
  var contenteditable = typeof document.documentElement.contentEditable !== 'undefined'

  /**
   * Check selectionchange event (currently supported in IE, Chrome and Safari)
   *
   * couldn't find anything helpful on the web so far.
   */
  var selectionchange = (function () {

    // not exactly feature detection... is it?
    var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    return !isFirefox;
  })();


  return {
    contenteditable: contenteditable,
    selectionchange: selectionchange
  };

})();