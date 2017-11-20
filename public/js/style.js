window.onload = function() {
  var footer = $('#footer-bottom');
  if ((screen.height - $("body").height() - footer.height()) < 10) {
  	footer.css("position", "relative");
  }
};