(function ($) {

    // CLASS

    var ninjaTable = function (table, options) {

		// Default settings
        var _options = {

            // String with base url or function returning full url
            url: null,
            query: null,
            orderBy: null,
            order: 'ASC',
            limit: 10,
            page: 1,
            fields: null,
            search: true,
            navigation: true,

            // Callback for override data loading
            cbLoadData: null,

            // Callback for transforming data structure
            cbTransformData: null,

            // Callback on data has changed (on page changed, on search , etc.. )
            cbDataChanged: null,
			
			// Dump debug info
			debug: false,
			
			// Show warning information
			warning: true
        };

        this.options = $.extend(_options, options);
		
        this.table = table;

        this.lastData = null;
		
		this.sanitizeFields();

        this.initTable();
		
        this.refresh();

        if( this.options.search )
            this.loadSearch();
			

        return this;
    };
		
	ninjaTable.handlebars = function(){
		
		if( ninjaTable._handleBars )
			return ninjaTable._handleBars;
		
		var hb = Handlebars;
		
		if( !hb && require != undefined )
			hb = require('handlebars');
		
		ninjaTable._handleBars = hb;
		return hb;
	}
	
	ninjaTable.prototype.debug = function( arg ){
		if( this.options.debug )
			console.log('[ninjaTable] DEBUG: ', arg );
	}

    ninjaTable.prototype.warning = function( arg ){
        if( this.options.warning )
            console.log('[ninjaTable] WARNING: ', arg );
    }
	
	ninjaTable.prototype.error = function( arg ){
		console.error('[ninjaTable] ERROR: ', arg );
	}
	
	ninjaTable.prototype.sanitizeFields = function () {
	
		var fields = [];
		
		$.each( this.options.fields , function(){
		
			if( !this.label ){
				fields.push( {
					label: this,
					name: this
				} );
			} else {
				fields.push( this );
			}
				
		} );
		
		this.options.fields = fields;
	}
	
	ninjaTable.prototype.loadData = function ( options , onDone , onError ) {
	
		var self = this;

        // Default ajax loading
        var _fncLoad = function( params , onDone , onError ){
            if (!params.url)
                self.error( 'No url specified!' );

            /*
             url: null,
             query: null,
             orderBy: null,
             order: 'ASC',
             limit: 10,
             page: 1,
             fields: null
             */

            if( params.url.length ) // url is string
                url = self.buildUrl( params );

            if( typeof( params.url ) == 'function' )
                url = params.url( params );

            self.debug('START AJAX -> ' + url);

            $.ajax({
                url: url
            }).done(function (data) {
                self.debug('REQUEST DONE');
				
				if( typeof( data ) == 'string' ){
					self.debug( 'The fetched data from server is a string: casting to object.' );

                    try {
					    data = JSON.parse( data );
                    } catch( e ){
                        self.error( 'Data fetched from server is bad formatted or invalid.' )
                        self.error( 'JSON: ' + e.message );
                    }
				}
				
                self.debug(data);
				
                if (onDone)
                    onDone(data);
            }).error(function (error) {
                error(error);
                if (onError)
                    onError(data);
            });
        };

        if( this.options.cbLoadData )
            _fncLoad = this.options.cbLoadData;

		_fncLoad( options, onDone ,  onError );
	};
	
	ninjaTable.prototype.initTable = function () {

		var ninjaTable = this;
		
        var table = $(ninjaTable.table);

		// Search or create thead / th and tbody structure
		if( table.children( 'thead' ).length == 0 ){
			$( '<thead />' ).appendTo( table );
		}
		
		if( table.find( 'thead th' ).length == 0 ){
			$.each(ninjaTable.options.fields, function () {
                table.find('thead').append('<th>' + this.label + '</th>');
            });
		} else {

            if( table.find( 'thead th' ) != this.options.fields.length ){
                this.warning('The given fields count and <th> count mismatch.');
            }
        }
		
		if( table.children( 'tbody' ).length == 0 ){
			$( '<tbody />' ).appendTo( table );
		}
		
		// Search for a first tr as html template
		if( table.children( 'tbody tr:first' ).length != 0 ){
			ninjaTable.rowHtmlTemplate = table.find( 'tbody tr:first' );
			table.find( 'tbody tr' ).remove();
		}

    };

	ninjaTable.prototype.buildRow = function ( item ) {
		
		var htmlTemplate = this.rowHtmlTemplate;
		
		if( !htmlTemplate ){ // Create default row template
			htmlTemplate = '<tr>' + '<td></td>'.repeat( this.options.fields.length ) + '</tr>';
		}
		
		var row = $(htmlTemplate).clone();
		row = $(row).html('');
				
		$.each(this.options.fields,function( index ){
		
			var cell = $($(htmlTemplate).find('td')[index]).clone();

            var cellHtml = '';

            if( item[ this.name ] )
                cellHtml = item[ this.name ];

			$(cell).html( cellHtml );
			
			
			row.append(cell);
			
			if(this.custom){
				row.append($('<td></td>').html(this.custom(item)));
			}
		});
		
		return row;
	};
	
    ninjaTable.prototype.buildUrl = function ( params ) {
        var url = params.url + '?';

        if (params.query)
            url += '&q=' + encodeURI(params.query);

        if (params.orderBy)
            url += '&o=' + params.orderBy;

        if (params.limit)
            url += '&l=' + params.limit;

        if (params.page)
            url += '&p=' + params.page;


        if (params.fields.length > 0) {
            url += '&f=';
            $.each(params.fields, function () {
                if(!this.custom)
                    url += this.name + ',';
            });
        }

        return url;
    };

    ninjaTable.prototype.loadSearch = function () {

		var ninjaTable = this;
		
        var table = $(ninjaTable.table);

        var searchRow;


        if (!(searchRow = ninjaTable.searchRow)) {
            searchRow = $('<div></div>', {
                // ToDo: Remove
                class: 'row text-right small-12 medium-offset-6 medium-6 large-offset-8 large-4 search-input'
            });
            table.before(searchRow);
        } else {
            searchRow.empty();
        }

        var searchInput = $('<input />', {
            type: 'text',
            class: 'ninjaTableSearch',
            placeholder: 'Cerca..',
            value: ninjaTable.options.query
        });


        searchInput.keyup(function (e) {
            if (e.keyCode == 13) {
                ninjaTable.search($(this).val());
            }
        });

        searchRow.html(searchInput);

        ninjaTable.searchRow = searchRow;

    };

	ninjaTable.prototype.buildPageButton = function ( pageNumber ) {
		page = $('<span></span>', {
			class: 'ninjaTableGoTo' + ( pageNumber == this.options.page ? ' selected' : '' ),
			goto: pageNumber
		});
		page.text( pageNumber );
		
		return page;
	}
	
    ninjaTable.prototype.loadNavigation = function (data) {

        this.debug('LOAD NAVIGATION');

		var ninjaTable = this;
		
        var table = $(this.table);

        var navRow;


        if (!(navRow = ninjaTable.navRow)) {
            navRow = $('<div></div>', {
				// Removed
                //class: 'row text-right small-12 medium-offset-6 medium-6 large-offset-8 large-4 ninjaNav'
            });
            table.after(navRow);
        } else {
            navRow.empty();
        }


        ninjaTable.totPages = Math.ceil(data.count / ninjaTable.options.limit);
		
		var curPage = parseInt( ninjaTable.options.page );
		
		if( curPage - 3 > 1 ){ // First page is not visible
			navRow.append( ninjaTable.buildPageButton( 1 ) );
		}
		
		for( var p = curPage - 3; p <= curPage; p++ ){
			if( p <= 0 ) continue;
            navRow.append( ninjaTable.buildPageButton( p ) );
		}
		
		for( var p = curPage +1 , c = 3; p < ninjaTable.totPages && c > 0; p++ , c-- ){
            navRow.append( ninjaTable.buildPageButton( p ) );
		}
		
		navRow.append( ninjaTable.buildPageButton( ninjaTable.totPages ) );
		
        /*var page;
        for (var i = 1; i <= ninjaTable.totPages; i++) {
            page = $('<span></span>', {
                class: 'ninjaTableGoTo',
                goto: i
            });
            page.text(i);
            navRow.append(page);
            navRow.append(' - ');
        }*/

        $('.ninjaTableGoTo:not(.selected)').off().on('click', function () {
            $('.ninjaTableGoTo').removeClass('selected');
            $(this).addClass('selected');
            ninjaTable.goToPage($(this).attr('goto'));
        });

        ninjaTable.navRow = navRow;


    };
	
    ninjaTable.prototype.refresh = function () {
        this.debug('REFRESH');
        
		var self = this;
		
		this.loadData( self.options, function (result) {

            if( self.options.cbTransformData ){
                result = self.options.cbTransformData( result );
            }

            if( result.data.length != self.options.limit && self.currentPage() == 1 ){
                self.warning(
                    'Fetched data count ('+
                    result.data.length+
                    ') mismatch the requested limit ('+
                    self.options.limit+
                    '). Fixing current limit to '+
                    result.data.length
                );

                self.options.limit = result.data.length;
            }

            self.lastData = result;

            var body = $(self.table).children('tbody');

            if (body.length == 0)
                body = $('<tbody></tbody>');


            body.empty();

            var data = result.data;
			if( !data )
				data = result;

            $.each(data, function () {

                var item = this;

                row = self.buildRow( this );
				
                body.append(row);
            });


            $(self.table).append(body);

            if( self.options.cbDataChanged )
                self.options.cbDataChanged();

            if (self.options.navigation)
                self.loadNavigation(result);


        }, function (data) {

            error(data);

        });
		
    };

    ninjaTable.prototype.search = function (str) {
        this.debug('SEARCH: ' + str);
        this.options.query = str;
        this.options.page = 1;
        this.refresh();
    };

    ninjaTable.prototype.currentPage = function () {
        return this.options.page;
    };

    ninjaTable.prototype.pagesCount = function () {
        if( !this.lastData )
            return 0;

        return Math.ceil(this.lastData.count / this.options.limit);
    };

    ninjaTable.prototype.itemsCount = function () {
        if( !this.lastData )
            return 0;

        return this.lastData.count;
    };

    ninjaTable.prototype.prevPage = function () {

        var page = this.options.page - 1;

        if (page <= 0 || page > this.totPages)
            return this.debug('PAGE ' + page + ' NOT EXISTS');

        this.debug('PREV PAGE (' + page + ')');
        this.options.page--;
        this.refresh();
    };

    ninjaTable.prototype.nextPage = function () {

        var page = this.options.page + 1;

        if (page <= 0 || page > this.totPages)
            return this.debug('PAGE ' + page + ' NOT EXISTS');

        this.debug('NEXT PAGE (' + page + ')');
        this.options.page++;
        this.refresh();
    };

    ninjaTable.prototype.goToPage = function (page) {

        if( typeof( page ) == 'string' )
            page = parseInt(page);

        if (page <= 0 || page > this.totPages)
            return this.debug('PAGE ' + page + ' NOT EXISTS');

        if (page == this.options.page)
            return this.debug('PAGE ' + page + ' IS ALREADY SELECTED ');

        this.debug('GOTO PAGE (' + page + ')');
        this.options.page = page;
        this.refresh();
    };


    // PLUGIN CODE


    $.fn.ninjaTable = function (arg, arg1, arg2) {
		
        if ($(this).data('ninjaTable')) {

            var ret = undefined;

            $(this).data('ninjaTable').debug('GET ISTANCE');

            if (typeof (arg) == "string") {
                if ($(this).data('ninjaTable')[arg]) {
                    $(this).data('ninjaTable').debug('CALL FUNCTION ' + arg);
                    ret = $(this).data('ninjaTable')[arg](arg1, arg2);
                }
            } else {
                $(this).data('ninjaTable').debug('ISTANCE ALREADY EXISTS');
            }

            if( ret )
                return ret;

            return this;

        }


        //self.debug('NEW ISTANCE');


        return this.each(function () {

            //self.debug(options);

            $(this).data('ninjaTable', new ninjaTable(this, arg));

            /// DA CONTINUARE


        });


    };

})(jQuery);