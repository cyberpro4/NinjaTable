(function ($) {

    // UTILITIES

    var debug = function (arg) {

        console.log('[ninjaTable] DEBUG: ', arg);

    };

    var error = function (arg) {

        console.error('[ninjaTable] ERROR: ', arg);

    };

    // AJAX

    var ajax = function (params, onDone, onError) {

        if (!params.url)
            debug('URL EMPTY');

        debug('START AJAX -> ' + params.url);


        /*
         url: null,
         query: null,
         orderBy: null,
         order: 'ASC',
         limit: 10,
         page: 1,
         fields: null
         */

        var url = params.url + '?';

        if (params.query)
            url += '&q=' + encodeURI(params.query);

        if (params.orderBy)
            url += '&o=' + params.orderBy;

        if (params.limit)
            url += '&l=' + params.limit;

        if (params.page)
            url += '&p=' + params.page;

        if (params.fields)
            url += '&f=' + params.fields.join();

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


    // TABLE

    var initTable = function (ninjaTable) {

        var table = $(ninjaTable.table);

        table.data();

        table.empty();

        var head = $('<thead></thead>');

        var row = $('<tr></tr>');

        $.each(ninjaTable.options.fields, function () {
            row.append('<th>' + this + '</th>');
        });

        head.append(row);

        table.append(head);


    };

    var loadTools = function(ninjaTable){

        var table = $(ninjaTable.table);
        
        if(ninjaTable.options.search) {

            var searchRow = $('<div></div>', {
                class: 'row text-right small-12 medium-offset-6 medium-6 large-offset-8 large-4 search-input'
            });

            var searchInput = $('<input />', {
                type: 'text',
                class: 'ninjaTableSearch',
                placeholder: 'Cerca..'
            });

            searchInput.on('input', function () {
                ninjaTable.search($(this).val());
            });

            searchRow.html(searchInput);

            table.before(searchRow);

        }


    };


    var loadData = function (ninjaTable) {

        initTable(ninjaTable);

        var data = ajax(ninjaTable.options, function (data) {

            var body = $('<tbody></tbody>');

            $.each(data, function () {

                var row = $('<tr></tr>');

                $.each(this, function (i, v) {

                    /*
                     if ($.inArray(i, options.fields) === -1)
                     return true;
                     */

                    var cell = $('<td></td>');
                    cell.html(v);
                    row.append(cell);

                });

                body.append(row);
            });


            $(ninjaTable.table).append(body);

        }, function (data) {


        });

    };


    // CLASS

    var ninjaTable = function (table, options) {

        this.table = table;
        this.options = options;


        loadData(this);
        loadTools(this);

        return this;
    };

     ninjaTable.prototype.refresh = function(){
        loadData(this);
    };

    ninjaTable.prototype.search = function(str){
        this.options.query = str;
        this.refresh();
    };

    ninjaTable.prototype.prevPage = function(){
        this.options.page--;
        this.refresh();
    };

    ninjaTable.prototype.nextPage = function(){
        this.options.page++;
        this.refresh();
    };


    // PLUGIN CODE


    $.fn.ninjaTable = function (arg) {


        if (typeof(arg) != 'object')
            if ($(this).data('ninjaTable'))
                return $(this).data('ninjaTable');


        // SETTINGS

        var _options = {
            url: null,
            query: null,
            orderBy: null,
            order: 'ASC',
            limit: 10,
            page: 1,
            fields: null,
            search: true

        };

        options = $.extend(_options, arg);


        return this.each(function () {

            debug(options);

            $(this).data('ninjaTable', new ninjaTable(this, options));

            /// DA CONTINUARE


        });


    };

})(jQuery);