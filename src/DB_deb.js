// server.js
var jsonServer = require( "json-server" );
var server = jsonServer.create( );
var router = jsonServer.router( "./src/DB.json" );
var middlewares = jsonServer.defaults( );
server.use( function( req, res, next ) {
    console.log( req.method );
    if ( req.method === "POST" ) {
        var qs = require( "querystring" );
        var body = "";
        req.on( "data", function( data ) {
            body += data;
        } );
        req.on( "end", function( ) {
            var POST = qs.parse( body );
            console.log( POST );
        } );
    } else if ( req.method === "GET" ) {
        var url = require( "url" );
        var urlParts = url.parse( req.url, true );
        console.log( urlParts.query );
    }
    next( );
} );
server.use( middlewares );
server.use( router );
server.listen( 3000, function( ) {
    console.log( "JSON Server is running" );
} );
router.render = function( req, res ) {
    //console.log( req.url );
    //console.log( router.db.__wrapped__.inventario.length );
    if ( req.url.indexOf( "/inventario" ) === 0 ) {
        var records = router.db.__wrapped__.inventario.length;
        res.jsonp( {
            rows: res.locals.data,
            total: Math.ceil( records / res.locals.data.length ),
            page: req._page,
            records: records
        } );
    } else {
        res.jsonp( res.locals.data );
    }
};
