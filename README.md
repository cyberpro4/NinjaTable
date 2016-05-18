# NinjaTable
Full-Ajax based JQuery plugin for managing tables.

NinjaTable is a jQuery plugin that let you display any ajax data source inside a customizable html table.
Some important features are:
 - Pagination
 - Items search
 - Customizable html template
 - Ajax data formatting

## Basic ajax data source
By default NinjaTable will format ajax request options as url arguments described below:
 - **"p"** : Page number
 - **"l"** : Per-page items limit
 - **"f"** : Requested fields separated by comma

For example, given a base url "http://customsite.com", the requested url for page 1, items limit 3 with fields "name" and "value" will be:
```
    http://customsite.com/?p=1&l=3&f=name,value
```
The expected output will be a JSON response like below:
```json
    {
        "data": [
            { "name": "Apple" , "value": "1" },
            { "name": "Orange" , "value": "3" },
            { "name": "Banana" , "value": "5" }
        ],
        "count": 33
    }
```
Where **data** is an array containing every items the table must display and **count** is the number of items (It will be used for pagination).

## Options
Here's a list of available options:
 - **url** : *\[required\] \( String | Function \)* A string containing base url for ajax request or a function returning the full ajax url for obtaining data.
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

 - **fields** : *\[required\] \( Array \)* An array containing each table columns as String or more descriptive object:
```javascript
    $( 'table' ).ninjaTable({
        url: 'http://customsite.com',
        fields: [ 
            { label: 'Author' , name: 'author' } 
        ] 
    });
```
 - **query** : *\[optional\] \( String \)*
 - **orderBy** : *\[optional\] \( String \)*
 - **order** : *\[optional\] \( String \)*
 - **limit** : *\[optional, default: 10\] \( Number \)*
 - **page** : *\[optional, default: 1\] \( Number )*
 - **search** : *\[optional, default: false\] \( String \)*
 - **navigation** : *\[optional, default: true\] \( Boolean \)*
 - **cbLoadData** : *\[optional\] \( Function \)*
 - **cbTransformData** : *\[optional\] \( Function \)*

## Templating

By default ninjaTable will build the most common and anonymous table structure: whenever you need to specify a custom html/css structure (as for bootstrap or zurb), just put it inside.

You can specify only <thead> tag like below:

```html
 <script> 
   $('.table').ninjaTable({
     url: 'http://customsite.com',
     fields: ['column_1','url']
   } ); 
 </script>
 
 <table class="table">
    <thead>
       <th class="thead">
          <td class="thead_col1">Column1</td>
          <td class="thead_col2">Url</td>
       </th>
    </thead>
 </table>
```

You can also write the per-row html template:

```html
 <script> 
   $('.table').ninjaTable({
     url: 'http://customsite.com', fields: ['column_1','url']
   } ); 
 </script>
 
 <table class="table">
    <thead>
       <th class="thead">
          <td class="thead_col1">Column1</td>
          <td class="thead_col2">Url</td>
       </th>
    </thead>
    <tbody>
      <tr>
        <td class="tbody_col1"></td>
        <td class="tbody_col2" data-custom-value="45"></td>
      </tr>
    </tbody>
 </table>
```
