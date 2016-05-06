# NinjaTable
Full-Ajax based JQuery plugin for managing tables

## Options
Here's a list of available options:
 - **url** : [required] ( String | Function ) A string containing base url for ajax request or a function returning the full ajax url for obtaining data.
```javascript
    $( 'table' ).ninjaTable({
        url: 'http://customsite.com',
        fields: [ 'name' ] 
    });
    
    // Requested url: http://customsite.com?p=1&l=10&f=name
```
You can also write your custom url-building function:
```javascript
    $( 'table' ).ninjaTable({
        url: function( options ){
            return 'http://customsite.com/search?page=' + options.page 
                + '&limit=' + options.limit;
        },
        fields: [ 'author' ] 
    });
    
    // Requested url: http://customsite.com?page=1&limit=10
```

 - **fields** : [required] ( Array ) An array containing each table columns as String or more descriptive object:
```javascript
    $( 'table' ).ninjaTable({
        url: 'http://customsite.com',
        fields: [ 
            { label: 'Author' , name: 'author' } 
        ] 
    });
```
 - **query** : [optional] ( String )
 - **orderBy** : [optional] ( String )
 - **order** : [optional] ( String )
 - **limit** : [optional, default: 10] ( Number )
 - **page** : [optional, default: 1] ( Number )
 - **search** : [optional, default: false] ( String )
 - **navigation** : [optional, default: true] ( Boolean )
 - **cbLoadData** : [optional] ( Function )
 - **cbTransformData** : [optional] ( Function )