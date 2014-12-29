(function() {

/**********************
 *                    *
 *   Rendering code   *
 *                    *
 **********************/

// List of HTML entities for escaping.
var HTML_ENTITY_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;'
};

// Replacement finding RegExp for those entities
var _htmlEscapingReplaceRegex = new RegExp("(?:" + Object.keys(HTML_ENTITY_ESCAPES).join("|") + ")", "g");

// Replacement callback function for those entities
function _htmlEscaper(match) {
  return HTML_ENTITY_ESCAPES[match];
}

function _escapeHtml(value) {
  return (
    typeof value !== "string" ?
      "" :
      value.replace(_htmlEscapingReplaceRegex, _htmlEscaper)
  );
}

var IMPOSSIBLE_RESULT_VALUE = Math.PI;

var RESPONSE_CLASS_NAMES = {
  // Not Applicable" ("N/A") / Invalid
  "": "diff-invalid",
  // "Yes" / Good
  "true": "diff-good",
  // "No" / Bad
  "false": "diff-bad",
  // "Maybe?" / Uncertain
  "null": "diff-uncertain",
  // "Impossible result" / Impossible
  "IMPOSSIBLE": "diff-impossible"
};

function _getResponseClass(value) {
  var key =
    typeof value !== "undefined" ?
      (JSON.stringify(value) || "") :
      "";
  return RESPONSE_CLASS_NAMES[key] || RESPONSE_CLASS_NAMES.IMPOSSIBLE;
}

// var RESPONSE_HTML = {
//   // Not Applicable" ("N/A") / Invalid
//   "": '<span class="glyphicon glyphicon-ban-circle" title="Not Applicable" aria-label="Not Applicable"></span>',
//   // "Yes" / Good
//   "true": '<span class="glyphicon glyphicon-ok" title="Yes" aria-label="Yes"></span>',
//   // "No" / Bad
//   "false": '<span class="glyphicon glyphicon-remove" title="No" aria-label="No"></span>',
//   // "Maybe?" / Uncertain
//   "null": '<span class="glyphicon glyphicon-flag" title="Maybe?" aria-label="Maybe?"></span>',
//   // "Impossible result" / Impossible
//   "IMPOSSIBLE": '<span class="glyphicon glyphicon-fire" title="Impossible result" aria-label="Impossible result"></span>'
// };

var RESPONSE_HTML = {
  // Not Applicable" ("N/A") / Invalid
  "": '<span title="Not Applicable">&mdash;</span>',
  // "Yes" / Good
  "true": '<span title="Yes">Y</span>',
  // "No" / Bad
  "false": '<span title="No">N</span>',
  // "Maybe?" / Uncertain
  "null": '<span title="Maybe?">?</span>',
  // "Impossible result" / Impossible
  "IMPOSSIBLE": '<span class="glyphicon glyphicon-fire" title="Impossible result" aria-label="Impossible result"></span>'
};


function _getResponseHtml(value) {
  if (typeof value === "string") {
    return value;
  }

  var key =
    typeof value !== "undefined" ?
      (JSON.stringify(value) || "") :
      "";
  return RESPONSE_HTML[key] || RESPONSE_HTML.IMPOSSIBLE;
}

window.renderResults = function(outputEl, results) {
  if (!(outputEl && outputEl.nodeType && outputEl.nodeName)) {
    throw new Error("You must provide an Element argument for the `outputEl` parameter");
  }

  //
  // Simple properties
  //
  var simpleProperties = [
    "framed", "crossOrigin", "sandboxed",
    "unsandboxable", "resandboxable", "sandboxable",
  ];
  simpleProperties.forEach(function(prop) {
    var cell = outputEl.querySelector('td[data-type="' + prop + '"]');
    if (!cell) {
      throw new Error('Could not find expected descendant for `tr#' + outputEl.id + '`: `td[data-type="' + prop + '"]`');
    }

    cell.className = _getResponseClass(results[prop]);
    cell.innerHTML = _getResponseHtml(results[prop]);
  });


  //
  // Nested properties
  //
  var nestedProperties = [
    "allowForms", "allowPointerLock", "allowPopups",
    "allowSameOrigin", "allowScripts", "allowTopNavigation"
  ];

  var originalSandboxAllowances = results.sandboxAllowances;
  if (!originalSandboxAllowances) {
    results.sandboxAllowances = {};
  }

  nestedProperties.forEach(function(prop) {
    var cell = outputEl.querySelector('td[data-type="' + prop + '"]');
    if (!cell) {
      throw new Error('Could not find expected descendant for `tr#' + outputEl.id + '`: `td[data-type="' + prop + '"]`');
    }

    // e.g. "allowSameOrigin" --> "sameOrigin"
    var dataProp = prop.slice(5, 6).toLowerCase() + prop.slice(6);

    if (!originalSandboxAllowances) {
      results.sandboxAllowances[dataProp] = originalSandboxAllowances;
    }
    else if (!results.sandboxAllowances.hasOwnProperty(dataProp)) {
      // Register as an impossible result
      results.sandboxAllowances[dataProp] = IMPOSSIBLE_RESULT_VALUE;
    }

    cell.className = _getResponseClass(results.sandboxAllowances[dataProp]);
    cell.innerHTML = _getResponseHtml(results.sandboxAllowances[dataProp]);
  });


  //
  // Complex properties
  //

  // `crossOrigin` (already rendered above as a simple property) may need an additional comment appended
  var prop = "crossOrigin";
  var cell = outputEl.querySelector('td[data-type="' + prop + '"]');
  if (!cell) {
    throw new Error('Could not find expected descendant for `tr#' + outputEl.id + '`: `td[data-type="' + prop + '"]`');
  }
  if (results.framed === true && results.crossOrigin === true && results.sandboxed === true && results.sandboxAllowances.sameOrigin === false) {
    cell.innerHTML = '<span title="Yes (via sandboxing, at least)">Y*</span>';
  }

  // `errors` has a slightly more complicated rendering logic
  prop = "errors";
  cell = outputEl.querySelector('td[data-type="' + prop + '"]');
  if (!cell) {
    throw new Error('Could not find expected descendant for `tr#' + outputEl.id + '`: `td[data-type="' + prop + '"]`');
  }
  // var classKey =
  //   results[prop] === undefined ?
  //     undefined :
  //     (
  //       !results[prop] ?
  //         IMPOSSIBLE_RESULT_VALUE :
  //         results[prop].length === 0
  //     );
  // cell.className = _getResponseClass(classKey);

  var htmlKey =
    results[prop] === undefined ?
      undefined :
      (
        !results[prop] ?
          IMPOSSIBLE_RESULT_VALUE :
          results[prop].length === 0 ?
            '<span>0</span>' :
            '<a href="javascript:void(0);" role="button" title="Error(s) Details" aria-label="Error(s) Details" ' +
              'data-toggle="popover" data-container="body" data-placement="left" data-html="true" ' +
              'data-content="<pre>' + _escapeHtml(JSON.stringify(results[prop], null, 2)) + '</pre>"' +
            '>' +
              results[prop].length +
            '</a>'
      );
  cell.innerHTML = _getResponseHtml(htmlKey);

  // IMPORTANT: This last line of code relies on Bootstrap (and jQuery)
  // Enable the Bootstrap popover functionality
  $(cell).find('a[data-toggle="popover"]').popover();

};

})();