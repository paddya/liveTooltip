/*
    Live Tooltips 0.1 (compatible: jQuery 1.4.x)
	by Patrick Bisenius, 2010

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>
*/

/* @TODO
 * - make more than one tooltip per element possible
 * - absolute positioning of a tooltip
 * - prevent the browser's default tooltip on links 
 */

(function($, document) {
	
	$.fn.liveTooltip = function(options) {
		// define defaults
		var defaults = {
			fadeSpeed: false,
			contentHandler: $.noop,
			startEvents: 'mouseenter',
			stopEvents: 'mouseleave',
			updateEvents: 'mousemove',
			position: {x: 20, y: 20},
			absolutePositioning: false,
			trace: true,
			delay: 0,
			className: ''
		};
		// merge with plugin-params, fall back to defaults
		var settings = $.extend(defaults, options);

		settings.fadeSpeed = settings.fadeSpeed !== false ? settings.fadeSpeed : 0;

		// add tooltip if one of the startEvents is fired
		this.live(settings.startEvents, settings, function(e) {
			e.preventDefault();
			$(this).data('_oldTitle', this.title).removeAttr('title');
			setTimeout(function(e, elem, settings) {initTooltip.call(elem, e, settings);}, settings.delay, e, this, settings);

		});
		// remove tooltip if one of the stopEvents is fired
		this.live(settings.stopEvents, settings, function(e) {
			e.preventDefault();
			removeTooltip.call(this);
		});


		function initTooltip(e, settings) {
			if($(this).hasClass('jq-tooltip-active') || !$(this).isMouseOver())
				return;

			// create tooltip
			var tooltip = $('<div></div>').addClass('tooltip jq-tooltip').addClass(settings.className);
			settings.contentHandler.call(this, tooltip); // the element on which the event occured will be referenced by 'this' in the callback function
			// initial tooltip-position

			var initPositions = {
				x: !settings.absolutePositioning ? e.pageX + settings.position.x : settings.position.x,
				y: !settings.absolutePositioning ? e.pageY + settings.position.y : settings.position.y
			};

			tooltip.css({position: 'absolute', top: initPositions.y, left: initPositions.x});
			tooltip.hide().appendTo('body').fadeIn(settings.fadeSpeed);
			tooltip.data('constructor', this); // make it possible for callback functions to determine the constructing element of a tooltip
			$(this).data('settings', settings).data('elem', tooltip).addClass('jq-tooltip-active');

		}

		function removeTooltip() {
			var elem = $(this), settings = elem.data('settings');
			if(!elem.hasClass('jq-tooltip-active'))
				return;


			$(elem.data('elem')).fadeOut(settings.fadeSpeed, function() {
				$(this).remove();
			});
			elem.removeClass('jq-tooltip-active').data('elem', undefined).attr('title', elem.data('_oldTitle'));
		}

		// use one central event to update all tooltips or remove them if they shouldn't be active anymore
		$(document).bind('mousemove.tooltip', function(e) {
			$('.jq-tooltip-active').each(function() {
				var 
					$this = $(this),
					tooltip = $this.data('elem'),
					settings = $this.data('settings');

				// remove tooltip if the mouse is not over the element which triggered the tooltip anymore
				if(settings.stopEvents.indexOf('mouseleave') != -1 && !$this.isMouseOver())
					removeTooltip.call($this);

				if(settings.trace)
					tooltip.css({top: e.pageY + settings.position.y, left: e.pageX + settings.position.x});
			});

		});

	};

	// filtering plugin which checks whether the mouse is currently over the first element of the collection
	$.fn.isMouseOver = function() {
		var 
			elem = $(this[0]),
			offset = elem.offset(),
			box = {topLeft: {x: offset.left, y: offset.top}, bottomRight: {x: offset.left + elem.width(), y: offset.top + elem.height()}},
			mp = $(document).data('mousePosition');

		return mp.x >= box.topLeft.x && mp.x <= box.bottomRight.x && mp.y >= box.topLeft.y && mp.y <= box.bottomRight.y;

	};

	// save the current mouse position to the document
	$(document).bind('mousemove', function(e) {
		$(this).data('mousePosition', {x: e.pageX, y: e.pageY});
	});

})(jQuery, document);


