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
		pageParam: 'page',
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
	
	$.fn.endlessPage.settings = {};
  
  $.fn.endlessPage.plugin = function(element, options){
    $.fn.endlessPage.settings = $.extend( true, $.fn.endlessPage.defaults, options );
    
  	var $this = $(element);
			
		this.isLoading = false;
		
		this.lastScrollValue = window.pageYOffset;
		
		this.lastPage = false;
		
		this.appendTo = function(){
		  if(this.appendTo){
		    var element = $.fn.endlessPage.settings.appendTo === true ? $this : $($.fn.endlessPage.settings.appendTo);
	    }
		  return element;
		}; //appendTo
		
		this._isLastPage = function(xhr){
		  return (xhr && xhr.getResponseHeader($.fn.endlessPage.settings.lastPageHeader) && xhr.getResponseHeader($.fn.endlessPage.settings.lastPageHeader) == $.fn.endlessPage.settings.lastPageHeaderValue) || this.lastPage;
		}; //_isLastPage?
		
		this._freeToGo = function(){
		  return !this.isLoading && this._scrollToDown() && !this._isLastPage();
		}; //_freeToGo
		
		this._scrollToDown = function(){
		  return this.lastScrollValue < this._attachScrollTo().scrollTop();
		}; //_scrollToDown
		
		this._attachScrollTo = function(){
		  return $.fn.endlessPage.settings.useElementScroll ? $this : $(window);
		}
		
		this._distanceFromBottom = function(){
		  var distance;
		  
		  if($this[0] == document){
				distance = Math.max(document.body.scrollHeight, document.body.offsetHeight) - ($(window).scrollTop() + (window.innerHeight || document.documentElement.clientHeight));
			}
			else {
				if($.fn.endlessPage.settings.useElementScroll){
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
					if(self._distanceFromBottom() <= $.fn.endlessPage.settings.distance){
					  self.makeRequest();
					}
				}
				self.lastScrollValue = self._attachScrollTo().scrollTop();
			});
		}; //start
		
		this.makeRequest = function(){
		  var self = this;
		  
			$.fn.endlessPage.settings.currentPage++;
			
			var params = $.extend(true, {}, $.fn.endlessPage.settings.ajax);
			
			params.url = $.fn.endlessPage.settings.source;
			params.data = 'format='+ $.fn.endlessPage.settings.format +'&per_page='+ $.fn.endlessPage.settings.perPage +'&'+ $.fn.endlessPage.settings.pageParam +'='+ $.fn.endlessPage.settings.currentPage;
			params.beforeSend = function( jqXHR, before_send_settings ) {
				self.isLoading = true;
				
				if($.fn.endlessPage.settings.appendTo){
				  self.appendTo().append('<'+ $.fn.endlessPage.settings.loading.tag +' class="'+ $.fn.endlessPage.settings.loading.klass +'">'+ $.fn.endlessPage.settings.loading.HTML +'</'+ $.fn.endlessPage.settings.loading.tag +'>');
			  }
			  
				$.fn.endlessPage.settings.ajax.beforeSend.call(this, jqXHR, before_send_settings);
			}; //beforeSend
			params.error = function( jqXHR, textStatus, errorThrown ){
			  $.fn.endlessPage.settings.currentPage--;
			  
			  if($.fn.endlessPage.settings.appendTo){
			    self.appendTo().append('<'+ $.fn.endlessPage.settings.error.tag +' class="'+ $.fn.endlessPage.settings.error.klass +'">'+ $.fn.endlessPage.settings.error.HTML +'</'+ $.fn.endlessPage.settings.error.tag +'>');
		    }
				$.fn.endlessPage.settings.ajax.error.call(this, jqXHR, textStatus, errorThrown);
			}; //error
			params.success = function( data, textStatus, jqXHR ) {
			  if($.fn.endlessPage.settings.appendTo){
			    self.appendTo().append(data);
			  }
				$.fn.endlessPage.settings.ajax.success.call(this, data, textStatus, jqXHR );
			}; //success
			params.complete = function( jqXHR, textStatus ){
				self.isLoading = false;
				
				if($.fn.endlessPage.settings.appendTo){
				  self.appendTo().find('.'+ $.fn.endlessPage.settings.loading.klass).remove();
			  }
			  
				if(self._isLastPage(jqXHR)){
					self.lastPage = true;
					
					if($.fn.endlessPage.settings.appendTo){
					  self.appendTo().append('<'+ $.fn.endlessPage.settings.end.tag +' class="'+ $.fn.endlessPage.settings.end.klass +'">'+ $.fn.endlessPage.settings.end.HTML +'</'+ $.fn.endlessPage.settings.end.tag +'>');
				  }
				}
				
				$.fn.endlessPage.settings.ajax.complete.call(this, jqXHR, textStatus);
			}; //complete
			
			$.ajax(params);
		}; //makeRequest
	}; //endlessPage

})( jQuery );