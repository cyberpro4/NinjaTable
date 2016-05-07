# NinjaTable
Full-Ajax based JQuery plugin for managing tables

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
