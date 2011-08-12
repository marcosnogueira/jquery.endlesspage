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
		  var $this = this;
      $(function(){
        var _target = new $.fn.endlessPage.plugin($this, options);
        _target.start();
      });
    });
  };
  
  $.fn.endlessPage.defaults = {
    appendTo: true,
		currentPage: 1,
		distance: 150,
		end: {
		  tag: 'li',
		  HTML: 'Não existe mais itens a serem carregados',
		  klass: 'end'
		},
	  error: {
	    tag: 'li',
	    HTML: 'Ocorreu um erro ao carregar os itens',
	    klass: 'error'
		},
		format: 'js',
	  loading: {
	    tag: 'li',
	    HTML: 'Carregando, aguarde...',
	    klass: 'loading'
	  },
		lastPageHeader: 'X-Last-page',
		lastPageHeaderValue: 'true',
		perPage: 10,
		startPage: 1,
		source: document.location.href,
		useElementScroll: false,
		ajax: {
		  dataType: 'html',
		  beforeSend: function(){},
  		complete: function(){},
  		error: function(){},
  		success: function(){}
		}
	};
  
  $.fn.endlessPage.plugin = function(element, options){
    var settings = $.extend( true, $.fn.endlessPage.defaults, options );
    
  	var $this = $(element);
			
		this.isLoading = false;
		
		this.lastScrollValue = window.pageYOffset;
		
		this.lastPage = false;
		
		this.appendTo = function(){
		  if(this.appendTo){
		    var element = settings.appendTo === true ? $this : $(settings.appendTo);
	    }
		  return element;
		}; //appendTo
		
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
		  return settings.useElementScroll ? $this : $(window);
		}
		
		this._distanceFromBottom = function(){
		  var distance;
		  
		  if($this[0] == document){
				distance = Math.max(document.body.scrollHeight, document.body.offsetHeight) - ($(window).scrollTop() + (window.innerHeight || document.documentElement.clientHeight));
			}
			else {
				if(settings.useElementScroll){
				  distance = Math.max($this[0].scrollHeight, $this[0].offsetHeight) - ($this.scrollTop() + $this.height());
				}
				else {
				  distance = ($this.offset().top + $this.height()) - ($(window).scrollTop() + (window.innerHeight || document.documentElement.clientHeight));
				}
			}
			
			return distance;
		}; //_distanceFromBottom
		
		this.start = function(){
		  var self = this;

		  self._attachScrollTo().scroll(function(){
		    if(self._freeToGo()){
					if(self._distanceFromBottom() <= settings.distance){
					  self.makeRequest();
					}
				}
				self.lastScrollValue = self._attachScrollTo().scrollTop();
			});
		}; //start
		
		this.makeRequest = function(){
		  var self = this;
		  
			settings.currentPage++;
			
			var params = $.extend(true, {}, settings.ajax);
			
			params.url = settings.source;
			params.data = 'format='+ settings.format +'&per_page='+ settings.perPage +'&page='+ settings.currentPage;
			params.beforeSend = function( jqXHR, before_send_settings ) {
				self.isLoading = true;
				
				if(settings.appendTo){
				  self.appendTo().append('<'+ settings.loading.tag +' class="'+ settings.loading.klass +'">'+ settings.loading.HTML +'</'+ settings.loading.tag +'>');
			  }
			  
				settings.ajax.beforeSend.call(this, jqXHR, before_send_settings);
			}; //beforeSend
			params.error = function( jqXHR, textStatus, errorThrown ){
			  settings.currentPage--;
			  
			  if(settings.appendTo){
			    self.appendTo().append('<'+ settings.error.tag +' class="'+ settings.error.klass +'">'+ settings.error.HTML +'</'+ settings.error.tag +'>');
		    }
				settings.ajax.error.call(this, jqXHR, textStatus, errorThrown);
			}; //error
			params.success = function( data, textStatus, jqXHR ) {
			  if(settings.appendTo){
			    self.appendTo().append(data);
			  }
				settings.ajax.success.call(this, data, textStatus, jqXHR );
			}; //success
			params.complete = function( jqXHR, textStatus ){
				self.isLoading = false;
				
				if(settings.appendTo){
				  self.appendTo().find('.'+ settings.loading.klass).remove();
			  }
			  
				if(self._isLastPage(jqXHR)){
					self.lastPage = true;
					
					if(settings.appendTo){
					  self.appendTo().append('<'+ settings.end.tag +' class="'+ settings.end.klass +'">'+ settings.end.HTML +'</'+ settings.end.tag +'>');
				  }
				}
				
				settings.ajax.complete.call(this, jqXHR, textStatus);
			}; //complete
			
			$.ajax(params);
		}; //makeRequest
	}; //endlessPage

})( jQuery );