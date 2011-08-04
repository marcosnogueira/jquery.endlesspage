/**
* jQuery Endless Page plugin
*
* Copyright (c) 2011 Dito Internet
* Authors: Marcos Nogueira (marcosnogueira@live.com) and Sergio Henrique (sergiohenriquetp@gmail.com)
* Description: A jQuery plugin that do pagination like facebook.
* 	When the scroll hit the bottom of the page, a ajax function will be called.
* 	A HTTP Header Response is checked to verify if we're done with the pagination (last page)
*
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
*
*/

(function( $ ){
  $.fn.endlessPage = function(options) {
		var settings = {
			distance: 150,
			current_page: 1,
			start_page: 1,
			url: '',
			beforeSend: function(){},
			error: function(){},
			complete: function(){},
			success: function(){}
		}
		
		return this.each(function() {        
      if ( options ) { 
        $.extend( settings, options );
      }
			var self = $(this);
			
			var endlessPage = {
				isLoading: false,
				lastScrollValue: window.pageYOffset,
				lastPage: false,
				start: function(){
					
				  $(window).scroll(function(){
						if(!endlessPage.isLoading && endlessPage.lastScrollValue < $(document).scrollTop() && !endlessPage.lastPage){
							if(self[0] == document){
								var height = Math.max(document.body.scrollHeight, document.body.offsetHeight);
							}
							else {
								var height = self.offset().top + self.height();
							}
							var distance_from_bottom = height - ($(document).scrollTop() + (window.innerHeight || document.documentElement.clientHeight));
							
							if(distance_from_bottom <= settings.distance){
								endlessPage.makeRequest();
							}
						}
						endlessPage.lastScrollValue = $(document).scrollTop();
		
					});
				},
				makeRequest: function(){
					settings.current_page++;
					$.ajax({
						url: settings.url,
						data: 'page='+ settings.current_page,
						beforeSend: function( jqXHR, before_send_settings ) {
							endlessPage.isLoading = true;
							settings.beforeSend.call(this, jqXHR, before_send_settings);
						}, //beforeSend
						error: function( jqXHR, textStatus, errorThrown ){
							settings.current_page--;
							settings.error.call(this, jqXHR, textStatus, errorThrown);
						}, //error
						success: function( data, textStatus, jqXHR ) {
							settings.success.call(this, data, textStatus, jqXHR );
						}, //success
						complete: function( jqXHR, textStatus ){
							endlessPage.isLoading = false;
							
							if(jqXHR.getResponseHeader('X-Last-page') && jqXHR.getResponseHeader('X-Last-page') == 'true'){
								endlessPage.lastPage = true;
							}
							
							settings.complete.call(this, jqXHR, textStatus);
						} //complete
					});
				}
			}; //endlessPage
			
			endlessPage.start();
			
    });
		

  };
})( jQuery );