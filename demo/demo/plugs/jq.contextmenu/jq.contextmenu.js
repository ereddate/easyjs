define(function(require, exports, module) {
	exports.exec = function(elem, ops) {
		var addItem = function(value, elemcode, menu, elem) {
			var li = jQuery("<li></li>");
			elemcode.append(li);
			switch (value.type) {
				case "text":
					li.addClass('contextMenu_text').html('<span>' + value.title + "</span>");
					break;
				case "line":
					li.addClass("contextMenu_line");
					break;
				case "button":
					li.addClass("contextMenu_button").html('<a href="">' + value.title + '</a>').one("a").click(function(e) {
						e.preventDefault();
						menu.hide();
						value.callback(elem[0], jQuery(this), e);
					});
					break;
				case "input":
					li.addClass('contextMenu_input').html('<input type="text" value="' + value.title + '" />');
					break;
				case "menu":
					var smenubox = jQuery("<div></div>"),
						smenu = jQuery("<menu></menu>").addClass("contextMenu_menu_list");
					jQuery.each(value.menu, function(i, snmenu) {
						smenu.append(addItem(snmenu, smenu, menu, elem));
					});
					smenubox.html('<span class="title">' + value.title + '</span>').append(smenu);
					li.addClass('contextMenu_menu').append(smenubox);
					break;
				case "checkbox":
					li.addClass('contextMenu_checkbox').html('<span' + (value.activeItem ? ' class="yes"' : "") + '></span><a href="">' + value.title + '</a>').attr("data-value", value.value).click(function(e) {
						e.preventDefault();
						menu.hide();
						value.callback(elem[0], jQuery(this), e);
					});
					break;
			}
			return li;
		};
		if (jQuery("#contextMenu_main").length > 0) jQuery("#contextMenu_main").remove();
		var menu = jQuery("<div></div>").attr({
			id: "contextMenu_main",
			class: "contextMenu_main_css"
		});
		elem.parent().append(menu);
		var elemcode = jQuery("<ul></ul>"),
			gtimeout,
			self = this;
		jQuery.each(ops, function(i, value) {
			var li = addItem(value, elemcode, menu, elem);
			menu.append(elemcode);
		});
		menu.hover(function() {
			clearTimeout(gtimeout);
		}, function() {
			clearTimeout(gtimeout);
			gtimeout = setTimeout(function() {
				menu.hide();
			}, 1000);
		});
		return menu;
	};
});