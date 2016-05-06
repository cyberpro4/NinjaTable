(function ($) {

    // UTILITIES

    var debug = function (arg) {

        console.log('[ninjaTable] DEBUG: ', arg);

    };

    var error = function (arg) {

        console.error('[ninjaTable] ERROR: ', arg);

    };

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
        };

        this.options = $.extend(_options, options);
		
        this.table = table;
		
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
		
		if( !hb )
			hb = require('handlebars');
		
		ninjaTable._handleBars = hb;
		return hb;
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
                debug('URL EMPTY');

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

            debug('START AJAX -> ' + url);

            $.ajax({
                url: url
            }).done(function (data) {
                debug('REQUEST DONE');
                debug(data);
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

        table.children('tbody').remove();

        if (table.children('thead').length == 0) {

            var head = $('<thead></thead>');

            var row = $('<tr></tr>');

            $.each(ninjaTable.options.fields, function () {
                row.append('<th>' + this.label + '</th>');
            });

            head.append(row);

            table.append(head);
        }


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

        debug('LOAD NAVIGATION');

		var ninjaTable = this;
		
        var table = $(this.table);

        var navRow;


        if (!(navRow = ninjaTable.navRow)) {
            navRow = $('<div></div>', {
                class: 'row text-right small-12 medium-offset-6 medium-6 large-offset-8 large-4 ninjaNav'
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
        debug('REFRESH');
        
		var self = this;
		
		this.loadData( self.options, function (result) {

            if( self.options.cbTransformData ){
                result = self.options.cbTransformData( result );
            }

            var body = $(self.table).children('tbody');

            if (body.length == 0)
                body = $('<tbody></tbody>');


            body.empty();

            var data = result.data;
			if( !data )
				data = result;

            $.each(data, function () {

                var item = this;

                var row = $('<tr></tr>');
				
                $.each(self.options.fields,function(){
				
					var cell = $('<td></td>');
					
                    cell.html( item[ this.name ] );
					
                    row.append(cell);
					
                    if(this.custom){
                        row.append($('<td></td>').html(this.custom(item)));
                    }
                });



                body.append(row);
            });


            $(self.table).append(body);

            if (self.options.navigation)
                self.loadNavigation(result);


        }, function (data) {

            error(data);

        });
		
    };

    ninjaTable.prototype.search = function (str) {
        debug('SEARCH: ' + str);
        this.options.query = str;
        this.options.page = 1;
        this.refresh();
    };

    ninjaTable.prototype.prevPage = function () {

        var page = this.options.page - 1;

        if (page <= 0 || page > this.totPages)
            return debug('PAGE ' + page + ' NOT EXISTS');

        debug('PREV PAGE (' + page + ')');
        this.options.page--;
        this.refresh();
    };

    ninjaTable.prototype.nextPage = function () {

        var page = this.options.page + 1;

        if (page <= 0 || page > this.totPages)
            return debug('PAGE ' + page + ' NOT EXISTS');

        debug('NEXT PAGE (' + page + ')');
        this.options.page++;
        this.refresh();
    };

    ninjaTable.prototype.goToPage = function (page) {

        if (page <= 0 || page > this.totPages)
            return debug('PAGE ' + page + ' NOT EXISTS');

        if (page == this.options.page)
            return debug('PAGE ' + page + ' IS ALREADY SELECTED ');

        debug('GOTO PAGE (' + page + ')');
        this.options.page = page;
        this.refresh();
    };


    // PLUGIN CODE


    $.fn.ninjaTable = function (arg, arg1, arg2) {

        if ($(this).data('ninjaTable')) {

            debug('GET ISTANCE');

            if (typeof (arg) == "string") {
                if ($(this).data('ninjaTable')[arg]) {
                    debug('CALL FUNCTION ' + arg);
                    $(this).data('ninjaTable')[arg](arg1, arg2);
                }
            } else {
                debug('ISTANCE ALREADY EXISTS');
            }

            return;

        }


        //debug('NEW ISTANCE');


        return this.each(function () {

            //debug(options);

            $(this).data('ninjaTable', new ninjaTable(this, arg));

            /// DA CONTINUARE


        });


    };

})(jQuery);