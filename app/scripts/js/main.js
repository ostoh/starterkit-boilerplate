(($) => {
	// open menu panel
	$(".mNavPanel").on("click", () => {
		$(".mobile-nav--pane").addClass("reveal-pane");
	});

	// hide menu panel
	$("#closeNavPanel").on("click", () => {
		$(".mobile-nav--pane").removeClass("reveal-pane");
	});

})(jQuery);
