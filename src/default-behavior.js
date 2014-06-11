/**
 * The Behavior module defines the behavior triggered in response to the Editable.JS
 * events (see {{#crossLink "Editable"}}{{/crossLink}}).
 * The behavior can be overwritten by a user with Editable.init() or on
 * Editable.add() per element.
 *
 * @module core
 * @submodule behavior
 */


var createDefaultBehavior = function(editable) {
  var document = editable.win.document;
  var config = editable.config;
  var selectionWatcher = editable.dispatcher.selectionWatcher;

  /**
    * Factory for the default behavior.
    * Provides default behavior of the Editable.JS API.
    *
    * @static
    */
  return {
    focus: function(element) {
      // Add a <br> element if the editable is empty to force it to have height
      // E.g. Firefox does not render empty block elements and most browsers do
      // not render  empty inline elements.
      if (parser.isVoid(element)) {
        var br = document.createElement('br');
        br.setAttribute('data-editable', 'remove');
        element.appendChild(br);
      }
    },

    blur: function(element) {
      content.cleanInternals(element);
    },

    selection: function(element, selection) {
      if (selection) {
        log('Default selection behavior');
      } else {
        log('Default selection empty behavior');
      }
    },

    cursor: function(element, cursor) {
      if (cursor) {
        log('Default cursor behavior');
      } else {
        log('Default cursor empty behavior');
      }
    },

    newline: function(element, cursor) {
      var atEnd = cursor.isAtEnd();
      var br = document.createElement('br');
      cursor.insertBefore(br);

      if (atEnd) {
        log('at the end');

        var noWidthSpace = document.createTextNode('\u200B');
        cursor.insertAfter(noWidthSpace);

        // var trailingBr = document.createElement('br');
        // trailingBr.setAttribute('type', '-editablejs');
        // cursor.insertAfter(trailingBr);

      } else {
        log('not at the end');
      }

      cursor.setVisibleSelection();
    },

    insert: function(element, direction, cursor) {
      var parent = element.parentNode;
      var newElement = element.cloneNode(false);
      if (newElement.id) newElement.removeAttribute('id');

      switch (direction) {
      case 'before':
        parent.insertBefore(newElement, element);
        element.focus();
        break;
      case 'after':
        parent.insertBefore(newElement, element.nextSibling);
        newElement.focus();
        break;
      }
    },

    split: function(element, before, after, cursor) {
      var parent = element.parentNode;
      var newStart = after.firstChild;
      parent.insertBefore(before, element);
      parent.replaceChild(after, element);
      content.normalizeTags(newStart);
      content.normalizeSpaces(newStart);
      newStart.focus();
    },

    merge: function(element, direction, cursor) {
      var container, merger, fragment, chunks, i, newChild, range;

      switch (direction) {
      case 'before':
        container = block.previous(element);
        merger = element;
        break;
      case 'after':
        container = element;
        merger = block.next(element);
        break;
      }

      if (!(container && merger))
        return;

      if (container.childNodes.length > 0)
        cursor.moveAtTextEnd(container);
      else
        cursor.moveAtBeginning(container);
      cursor.setVisibleSelection();

      fragment = document.createDocumentFragment();
      chunks = merger.childNodes;
      for (i = 0; i < chunks.length; i++) {
        fragment.appendChild(chunks[i].cloneNode(true));
      }
      newChild = container.appendChild(fragment);

      merger.parentNode.removeChild(merger);

      cursor.save();
      content.normalizeTags(container);
      content.normalizeSpaces(container);
      cursor.restore();
      cursor.setVisibleSelection();
    },

    empty: function(element) {
      log('Default empty behavior');
    },

    'switch': function(element, direction, cursor) {
      var next, previous;

      switch (direction) {
      case 'before':
        previous = block.previous(element);
        if (previous) {
          cursor.moveAtTextEnd(previous);
          cursor.setVisibleSelection();
        }
        break;
      case 'after':
        next = block.next(element);
        if (next) {
          cursor.moveAtBeginning(next);
          cursor.setVisibleSelection();
        }
        break;
      }
    },

    move: function(element, selection, direction) {
      log('Default move behavior');
    },

    clipboard: function(element, action, cursor) {
      var pasteHolder, sel;

      if (action !== 'paste') return;

      element.setAttribute(config.pastingAttribute, true);

      if (cursor.isSelection) {
        cursor = cursor.deleteContent();
      }

      pasteHolder = document.createElement('textarea');
      pasteHolder.setAttribute('style', 'position: absolute; left: -9999px');
      cursor.insertAfter(pasteHolder);
      sel = rangy.saveSelection();
      pasteHolder.focus();

      setTimeout(function() {
        var pasteValue, pasteElement, cursor;
        pasteValue = pasteHolder.value;
        element.removeChild(pasteHolder);

        rangy.restoreSelection(sel);
        cursor = selectionWatcher.forceCursor();
        pasteElement = document.createTextNode(pasteValue);
        content.normalizeSpaces(pasteElement);
        cursor.insertAfter(pasteElement);
        cursor.moveAfter(pasteElement);
        cursor.setVisibleSelection();

        element.removeAttribute(config.pastingAttribute);
      }, 0);
    }
  };
};