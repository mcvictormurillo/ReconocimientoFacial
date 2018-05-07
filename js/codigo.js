alert("¿Esta de acuerdo con utilizar la camara?");

// tell the embed parent frame the height of the content
if (window.parent && window.parent.parent) {
  window.parent.parent.postMessage(["resultsFrame", {
    height: document.body.getBoundingClientRect().height,
    slug: "opyh5e8d"
  }], "*")
}
