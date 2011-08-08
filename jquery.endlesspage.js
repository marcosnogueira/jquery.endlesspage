/*
* jQuery Endless Page plugin 0.0.1
*
* Copyright (c) 2011 Dito Internet
* Authors: Marcos Nogueira (marcosnogueira@live.com) and Sergio Henrique (sergiohenriquetp@gmail.com)
* Description: A jQuery plugin that does pagination like facebook.
* 	When the scroll hits the bottom of the page, an ajax function will be called.
* 	A HTTP Header Response is checked to verify if we're done with the pagination (last page)
*
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
*
*/

(function( $ ){
  $.fn.endlessPage = function(options) {
		return this.each(function() {
      var _target = new $.fn.endlessPage.plugin(this, options);
      _target.start();
    });
  };
  
  $.fn.endlessPage.plugin = function(element, options){
    var settings = {
  		current_page: 1,
  		dataType: 'html',
  		distance: 150,
		  endTag: 'li',
		  endHTML: 'Não existe mais itens a serem carregados',
		  endClass: 'end',
		  errorTag: 'li',
		  errorHTML: 'Ocorreu um erro ao carregar os itens',
		  errorClass: 'error',
  		format: 'js',
		  loadingTag: 'li',
		  loadingHTML: 'Carregando, aguarde...',
		  loadingClass: 'loading',
  		lastPageHeader: 'X-Last-page',
  		lastPageHeaderValue: 'true',
  		per_page: 10,
  		start_page: 1,
  		source: document.location.href,
  		useWindowScroll: true,
  		beforeSend: function(){},
  		complete: function(){},
  		error: function(){},
  		success: function(){}
  	};
  	
  	if(options) { 
      $.extend( settings, options );
    }
    
  	var $this = $(element);
			
		this.isLoading = false;
		
		this.lastScrollValue = window.pageYOffset;
		
		this.lastPage = false;
		
		this.makeRequest = function(){
		  var self = this;
		  
			settings.current_page++;
			$.ajax({
				url: settings.source,
				dataType: settings.dataType,
				data: 'format='+ settings.format +'&per_page='+ settings.per_page +'&page='+ settings.current_page,
				beforeSend: function( jqXHR, before_send_settings ) {
					self.isLoading = true;
					
					$(settings.appendTo).append('<'+ settings.loadingTag +' class="'+ settings.loadingClass +'">'+ settings.loadingHTML +'</'+ settings.loadingTag +'>');
					
					settings.beforeSend.call(this, jqXHR, before_send_settings);
				}, //beforeSend
				error: function( jqXHR, textStatus, errorThrown ){
				  settings.current_page--;
				  
				  $(settings.appendTo).append('<'+ settings.errorTag +' class="'+ settings.errorClass +'">'+ settings.errorHTML +'</'+ settings.errorTag +'>');
				  
					settings.error.call(this, jqXHR, textStatus, errorThrown);
				}, //error
				success: function( data, textStatus, jqXHR ) {
				  if(settings.appendTo){
				    $(settings.appendTo).append(data);
				  }
					settings.success.call(this, data, textStatus, jqXHR );
				}, //success
				complete: function( jqXHR, textStatus ){
					self.isLoading = false;
					
					$(settings.appendTo).find('.'+ settings.loadingClass).remove();
					
					if(self._isLastPage(jqXHR)){
						self.lastPage = true;
						
						$(settings.appendTo).append('<'+ settings.endTag +' class="'+ settings.endClass +'">'+ settings.endHTML +'</'+ settings.endTag +'>');
					}
					
					settings.complete.call(this, jqXHR, textStatus);
				} //complete
			});
		}; //makeRequest
		
		this._isLastPage = function(xhr){
		  return (xhr && xhr.getResponseHeader(settings.lastPageHeader) && xhr.getResponseHeader(settings.lastPageHeader) == settings.lastPageHeaderValue) || this.lastPage;
		}; //_isLastPage?
		
		this._freeToGo = function(){
		  return !this.isLoading && this._scrollToDown() && !this._isLastPage();
		}; //_freeToGo
		
		this._scrollToDown = function(){
		  return this.lastScrollValue < this._attachScrollTo().scrollTop();
		}; //_scrollToDown
		
		this._attachScrollTo = function(){
		  return settings.useWindowScroll ? $(window) : $this;
		}
		
		this._distanceFromBottom = function(){
		  if($this[0] == document){
				var height = Math.max(document.body.scrollHeight, document.body.offsetHeight);
			}
			else {
				var height = $this.offset().top + $this.height();
			}
			
			return height - ($(document).scrollTop() + (window.innerHeight || document.documentElement.clientHeight));
		}; //_distanceFromBottom
		
		this.start = function(){
		  var self = this;

		  self._attachScrollTo().scroll(function(){
		    if(self._freeToGo()){
					if(self._distanceFromBottom() <= settings.distance){
					  self.makeRequest();
					}
				}
				self.lastScrollValue = $(document).scrollTop();
			});
		}; //start
	}; //endlessPage

})( jQuery );