/*
 *  inventory - v4.1.0
 *  A jump-start for jQuery plugins development.
 *
 *
 *  Made by JD-R2
 *  Under MIT License
 */
( function( $, window, document, undefined ) {
    "use strict";
    // Create the defaults once
    var pluginName = "inventory",
        defaults = {
            mergeConfig: false,
            marca: true,
            advancedSearch: true,
            title: "Listado del Inventario",
            dataLoaded: false,
            dataProductos: {},
            jqgrid: {
                url: "http://localhost:3000/inventario",
                colNames: [ "", "", "Sucursal", "", "Producto", "Marca", "Existencia", "Mínimo", "Máximo", "Costo", "Precio", "" ],
                colModel: [
                    { name: "id", editable: false, sortable: false, hidden: true },
                    { name: "idSucursal", editable: false, sortable: false, hidden: true },
                    { name: "sucursal", align: "left", editable: false, sorttype: latinize, stype: "text", searchoptions: { sopt: [ "eq", "ne", "bw", "bn", "ew", "en", "cn", "nc", "nu", "nn", "in", "ni" ] } },
                    { name: "idProducto", editable: false, sortable: false, hidden: true },
                    { name: "producto", align: "left", editable: false, sorttype: latinize, stype: "text", searchoptions: { sopt: [ "eq", "ne", "bw", "bn", "ew", "en", "cn", "nc", "nu", "nn", "in", "ni" ] } },
                    { name: "marca", align: "left", editable: false, sorttype: latinize, stype: "text", searchoptions: { sopt: [ "eq", "ne", "bw", "bn", "ew", "en", "cn", "nc", "nu", "nn", "in", "ni" ] } },
                    { name: "existencia", template: "number", autoResizableMinColSize: 50, editable: true, autoResizing: { minColWidth: 50, resetWidthOrg: false, compact: false, fixWidthOnShrink: true } },
                    { name: "minimo", template: "number", autoResizableMinColSize: 50, editable: true, autoResizing: { minColWidth: 50, resetWidthOrg: false, compact: false, fixWidthOnShrink: true } },
                    { name: "maximo", template: "number", autoResizableMinColSize: 50, editable: true, autoResizing: { minColWidth: 50, resetWidthOrg: false, compact: false, fixWidthOnShrink: true } },
                    { name: "costo", formatter: "currency", autoResizableMinColSize: 50, editable: true, align: "right", autoResizing: { minColWidth: 50, resetWidthOrg: false, compact: false, fixWidthOnShrink: true }, formatoptions: { decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 2, prefix: "$ " }, searchoptions: { sopt: [ "eq", "ne", "lt", "le", "gt", "ge" ] } },
                    {
                        name: "precio",
                        formatter: "currency",
                        autoResizableMinColSize: 50,
                        editable: true,
                        align: "right",
                        autoResizing: {
                            minColWidth: 50,
                            resetWidthOrg: false,
                            compact: false,
                            fixWidthOnShrink: true
                        },
                        formatoptions: {
                            decimalSeparator: ".",
                            thousandsSeparator: ",",
                            decimalPlaces: 2,
                            prefix: "$ "
                        },
                        searchoptions: {
                            sopt: [ "eq", "ne", "lt", "le", "gt", "ge" ]
                        }
                    }, {
                        name: "act",
                        template: "actions",
                        width: 80,
                        formatoptions: {
                            delbutton: false
                        }
                    }
                ],
                datatype: "json",
                hidegrid: false,
                loadonce: true,
                navOptions: {
                    reloadGridOptions: {
                        fromServer: true
                    }
                },
                altRows: true,
                autowidth: true,
                shrinkToFit: true,
                viewrecords: true,
                loadui: true,
                autoresizeOnLoad: true,
                cmTemplate: {
                    autoResizable: true,
                    editable: true
                },
                guiStyle: "bootstrap",
                iconSet: "fontAwesome",
                rowNum: 10,
                autoResizing: {
                    compact: true
                },
                rowList: [ 10, 20, 50 /*, "10000:todos"*/ ],
                autoencode: true,
                sortable: true,
                pager: true,
                inlineEditing: {
                    keys: true,
                    defaultFocusField: "origen",
                    focusField: "origen"
                },
                rownumbers: false,
                caption: "",
                grouping: false,
                groupingView: { //no hace nada si grouping false
                    groupField: [ "sucursal" ],
                    groupColumnShow: [ true ],
                    groupText: [ "" ],
                    groupOrder: [ "asc" ],
                    groupSummary: [ false ],
                    groupSummaryPos: [ "header" ],
                    groupCollapse: true
                }
            },
            select2: {
                language: "es",
                minimumInputLength: 0,
                ajax: {
                    url: "http://localhost:3000/sucursales",
                    dataType: "json",
                    delay: 250,
                    cache: true,
                    data: {
                        language: "es"
                    }
                }
            }
        };
    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;
        if ( options.mergeConfig ) {
            options = $.extend( true, {}, {
                marca: false,
                advancedSearch: false,
                jqgrid: {
                    loadonce: false,
                    cmTemplate: { sortable: false },
                    colModel: [ {
                        name: "id"
                    }, {
                        name: "branchId"
                    }, {
                        name: "branchName"
                    }, {
                        name: "productId"
                    }, {
                        name: "productName"
                    }, {}, {
                        name: "stockQuantity"
                    }, {
                        name: "minQuantity"
                    }, {
                        name: "maxQuantity"
                    }, {
                        name: "cost"
                    }, {
                        name: "publicPrice"
                    } ],
                    prmNames: {
                        page: "draw",
                        rows: "length"
                    },
                    jsonReader: {
                        root: "data",
                        page: "draw",
                        records: "recordsFiltered"
                    },
                    ajaxGridOptions: {
                        url: './ajaxinventorylist',
                        method: 'POST',
                        async: true,
                        contentType: "application/json",
                        dataType: "json",
                        mimeType: "application/json"
                    },
                    serializeGridData: function( data ) {
                        var t1 = $( "#branchesFilter" ).find( "option:selected" ).val( );
                        var t2 = $( "#productsFilter" ).val( );
                        $.extend( data, {
                            "columns": [ {
                                "data": "branchName"
                            }, {
                                "data": "productName"
                            }, {
                                "data": "stockQuantity"
                            }, {
                                "data": "minQuantity"
                            }, {
                                "data": "maxQuantity"
                            }, {
                                "data": "cost"
                            }, {
                                "data": "publicPrice"
                            } ],
                            "start": ( data.draw - 1 ) * data.length,
                            "search": {},
                            "target1": t1 ? t1 : "",
                            "target2": t2,
                            "target3": ""
                        } );
                        return JSON.stringify( data );
                    },
                    loadError: function( response, error, xhr ) {
                        console.log( error );
                        console.log( response );
                    },
                    beforeProcessing: function( response ) {
                        response.recordsFiltered = parseInt( response.recordsFiltered );
                        var div = response.recordsFiltered / $( this ).getGridParam( 'rowNum' );
                        response.total = Math.ceil( div );
                    },
                },
                select2: {
                    allowClear: true,
                    multiple: false,
                    placeholder: {
                        id: "",
                        placeholder: "Selecciona"
                    },
                    ajax: {
                        url: "./ajaxBranchSimpleCatalogRequest",
                        method: "POST",
                        async: true,
                        contentType: "application/json",
                        dataType: "json",
                        mimeType: "application/json",
                        data: function( params ) {
                            return '{ "catalogName":"Cat_Branch","language": "es" }'
                        },
                        processResults: function( data, params ) {
                            params.page = params.page || 1;
                            return {
                                results: data.Cat_Branch,
                                pagination: {
                                    more: ( params.page * 30 ) < data.total_count
                                }
                            };
                        },
                        success: function( data ) {
                            // $("#branchesFilter").select2("destroy");
                        }
                    },
                    templateResult: function( repo ) {
                        // se puede colocar html en return
                        return repo.value;
                    },
                    templateSelection: function( repo ) {
                        return repo.value;
                    }
                }
            }, options );
        }
        this.settings = $.extend( true, {}, {
            jqgrid: {
                ondblClickRow: ondblClickRow,
                onSelectRow: onSelectRow
            },
            select2: {
                ajax: {
                    data: dataSelect2,
                    processResults: processResults
                },
                escapeMarkup: escapeMarkup, // let our custom formatter work
                templateResult: formatRepo, // omitted for brevity, see the source of this page
                templateSelection: formatRepoSelection // omitted for brevity, see the source of this page
            }
        }, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.init( );
    }

    function camelCase( string ) {
        return string.replace( /-([a-z])/ig, function( all, letter ) {
            return letter.toUpperCase( );
        } );
    }

    function formatRepo( repo ) {
        //se puede colocar html en return
        return repo.sucursal;
    }

    function formatRepoSelection( repo ) {
        return repo.sucursal;
    }

    function dataSelect2( params ) {
        return {
            q: params.term, // search term
            page: params.page
        };
    }

    function processResults( data, params ) {
        // parse the results into the format expected by Select2
        // since we are using custom formatting functions we do not need to
        // alter the remote JSON data, except to indicate that infinite
        // scrolling can be used
        params.page = params.page || 1;
        return {
            results: data,
            pagination: {
                more: ( params.page * 30 ) < data.total_count
            }
        };
    }

    function escapeMarkup( markup ) {
        return markup;
    }

    function onSelectRow( rowid, status, e ) {
        var $self = $( this ),
            savedRow = $self.jqGrid( "getGridParam", "savedRow" );
        if ( savedRow.length > 0 && savedRow[ 0 ].id !== rowid ) {
            $self.jqGrid( "restoreRow", savedRow[ 0 ].id );
        }
    }

    function ondblClickRow( rowid, iRow, iCol, e ) {
        var $self = $( this );
        $self.jqGrid( "editRow", rowid, {
            focusField: e.target
        } );
    }
    // Avoid Plugin.prototype conflicts
    $.extend( Plugin.prototype, {
        init: function( ) {
            var inventory = this;
            /**
             * remove from jqgrid settings "marca" if marca==false;
             */
            if ( !inventory.settings.marca ) {
                inventory.settings.jqgrid.colNames.splice( 5, 1 );
                inventory.settings.jqgrid.colModel.splice( 5, 1 );
            }
            /**
             * initialize elements
             */
            var $container = $( "<div>", { "class": "card-box inventory" } );
            var $title = $( "<h4>", {
                "class": "header-title m-t-0 m-b-30"
            } ).text( inventory.settings.title );
            var $rowFilters = $( "<div>", { "class": "row" } ).append( "<div class = 'col-sm-12' ></div>" );
            var $col4B = $( "<div>", { "class": "form-group col-sm-4" } );
            var $labelB = $( "<label>", { for: "branchesFilter", "class": "control-label btn-block" } ).text( "Sucursales" );
            var $selectBranchesFilter = $( "<select>", { "class": "form-control", id: "branchesFilter", multiple: "multiple" } );
            var $col4P = $col4B.clone( );
            var $labelP = $( "<label>", { for: "productsFilter", "class": "control-label" } ).text( "Producto" );
            var $inputProductsFilter = $( "<input>", { type: "text", "class": "form-control", id: "productsFilter" } );
            var $col4C = $( "<div>", { "class": "form-group col-sm-1" } );
            var $inputClearFilter = $( "<button>", { type: "button", "class": "form-control btn btn-danger disabled", id: "clearFilter", title: "Limpiar filtros", disabled: "disabled", css: { marginTop: 25 } } ).html( "<i class='fa fa-filter-remove'></i>" ).click( function( ) { inventory.filterClear( ); } );
            var $grid = $( "<table>" );
            $container.append( $title, $rowFilters, $grid );
            $rowFilters.find( "div" ).append( $col4B, $col4P, $col4C );
            $col4B.append( $labelB.append( $selectBranchesFilter ) );
            $col4P.append( $labelP, $inputProductsFilter );
            $col4C.append( $inputClearFilter );
            $( inventory.element ).append( $container );
            inventory.$grid = $grid;
            inventory.$selectBranchesFilter = $selectBranchesFilter;
            inventory.$inputProductsFilter = $inputProductsFilter;
            inventory.$inputClearFilter = $inputClearFilter;
            $selectBranchesFilter.select2( inventory.settings.select2 );
            $grid.jqGrid( inventory.settings.jqgrid )
                .jqGrid( "gridResize" ).jqGrid( "bindKeys" )
                .jqGrid( "navGrid", {
                    edit: false,
                    add: false,
                    del: false,
                    search: inventory.settings.advancedSearch,
                    refresh: true
                }, {}, {}, {}, {
                    closeAfterSearch: true,
                    multipleSearch: true,
                    multipleGroup: true
                } );
            /**
             * Events
             */
            $inputProductsFilter.on( "keyup", function( ) {
                if ( !inventory.keyupDelay ) {
                    inventory.keyupDelay = setTimeout( function( ) {
                        var st = $inputProductsFilter.val( );
                        inventory.filterByProducts( st );
                        inventory.keyupDelay = false;
                    }, 300 );
                }
                return false;
            } );
            $selectBranchesFilter.on( "change", function( e ) {
                var $selector = $( this );
                var branches = $selector.select2( "data" ).map( function( elem ) {
                    return elem.sucursal;
                } );
                inventory.filterByBranches( branches );
                setTimeout( function( ) {
                    $selector.parent( ).find( ".select2-selection__choice" ).addClass( "btn-primary" );
                }, 100 );
                return false;
            } );
            $( ".ui-jqgrid-title" ).click( function( ) {
                $( this ).parent( ).find( ".ui-jqgrid-titlebar-close" ).click( );
            } );
            $( ".ui-jqgrid-titlebar-close, .ui-pg-button" ).click( function( ) {
                setTimeout( function( ) {
                    $( window ).resize( );
                }, 200 );
            } );
            $grid.on( "jqGridInlineAfterSaveRow", function( e, rowID ) {
                var data = $grid.jqGrid( "getRowData", rowID );
                $( inventory.element ).trigger( "inventory.saveRow", data );
            } );
            $grid.on( "jqGridInlineEditRow", function( e, rowid, iRow ) {
                $( "#" + rowid ).find( "input" ).addClass( "form-control" );
            } );
            $( window ).resize( function( ) {
                $grid.setGridWidth( $grid.closest( ".ui-jqgrid" ).parent( ).innerWidth( true ) );
            } ).trigger( "resize" );
            $grid.on( "jqGridFilterBeforeShow", function( e, $form ) {
                $form.closest( ".ui-jqdialog" ).addClass( "inventory" );
            } );
            $grid.on( "jqGridFilterReset", function( e ) {
                //.closest(".modal").modal('toggle');
            } );
            $grid.on( "jqGridBeforeRequest", function( ) {
                if ( !inventory.$grid.jqGrid( "getGridParam", "search" ) ) {
                    inventory.filterDomClear( );
                }
            } );
        },
        filterGet: function( ) {
            var postData = this.$grid.jqGrid( "getGridParam", "postData" ),
                filters;
            try {
                filters = JSON.parse( postData.filters );
            } catch ( e ) {
                return false;
            }
            if ( typeof filters.groups !== "object" ) {
                filters.groups = [ ];
            }
            return filters;
        },
        filterObj: function( ) {
            return {
                groupOp: "AND",
                groups: [ ]
            };
        },
        filterSet: function( filters ) {
            /*var old = this.filterGet();
            if (old) {
                filters = $.extend(true, {}, old, filters);
			}*/
            var postData = this.$grid.jqGrid( "getGridParam", "postData" );
            postData.filters = JSON.stringify( filters );
            this.$grid.jqGrid( "setGridParam", {
                search: true
            } );
            this.$grid.trigger( "reloadGrid", [ {
                page: 1,
                current: true
            } ] );
            this.$inputClearFilter.removeClass( "disabled" ).prop( "disabled", false );
            return true;
        },
        filterClear: function( ) {
            this.filterDomClear( );
            var postData = this.$grid.jqGrid( "getGridParam", "postData" );
            postData.filters = "";
            this.$grid.jqGrid( "setGridParam", {
                search: false
            } );
            this.$grid.trigger( "reloadGrid", [ {
                page: 1,
                current: true
            } ] );
            return true;
        },
        filterDomClear: function( ) {
            this.$inputProductsFilter.val( "" );
            this.$selectBranchesFilter.val( null ).trigger( "change" );
            this.$inputClearFilter.addClass( "disabled" ).prop( "disabled", true );
        },
        filterByProducts: function( searchText ) {
            var filters = this.filterGet( );
            if ( !filters ) {
                filters = this.filterObj( );
            }
            var branchesObj = filters.groups.filter( function( elem ) {
                if ( elem.criteria === "products" ) {
                    elem.rules = [ {
                        field: "producto",
                        op: "cn",
                        data: searchText
                    } ];
                    return elem;
                }
            } );
            if ( branchesObj.length < 1 ) {
                filters.groups.push( {
                    criteria: "products",
                    groupOp: "OR",
                    rules: [ {
                        field: "producto",
                        op: "cn",
                        data: searchText
                    } ]
                } );
            }
            this.filterSet( filters );
            return true;
        },
        filterRmProduct: function( ) {
            var filters = this.filterGet( );
            if ( !filters ) {
                return true;
            }
            filters = filters.groups.filter( function( elem ) {
                if ( elem.criteria === "products" ) {
                    return;
                }
                return elem;
            } );
            this.filterSet( filters );
            return true;
        },
        filterByBranches: function( toSearch ) {
            var filters = this.filterGet( ),
                rules = [ ];
            if ( !filters ) {
                filters = this.filterObj( );
            }
            for ( var i in toSearch ) {
                rules.push( {
                    field: "sucursal",
                    op: "eq",
                    data: toSearch[ i ]
                } );
            }
            var branchesObj = filters.groups.filter( function( elem ) {
                if ( elem.criteria === "branches" ) {
                    elem.rules = rules;
                    return elem;
                }
            } );
            if ( branchesObj.length < 1 ) {
                filters.groups.push( {
                    criteria: "branches",
                    groupOp: "OR",
                    rules: rules
                } );
            }
            this.filterSet( filters );
            return true;
        },
        filterRmBranches: function( ) {
            var filters = this.filterGet( );
            if ( !filters ) {
                return true;
            }
            filters = filters.groups.filter( function( elem ) {
                if ( elem.criteria === "branches" ) {
                    return;
                }
                return elem;
            } );
            this.filterSet( filters );
            return true;
        },
        help: function( ) {
            var funcs = $.map( this, function( elem, i ) {
                if ( typeof elem === "function" ) {
                    return i;
                }
            } );
            console.log( "defaults" );
            console.log( defaults );
            console.log( "métodos disponibles" );
            console.log( funcs );
            console.log( "------------" );
            return [ JSON.stringify( defaults ), JSON.stringify( funcs ) ];
        }
    } );
    // preventing against multiple instantiations,
    // allowing set an action to do at the initialization
    $.fn[ pluginName ] = function( action, options ) {
        var toReturn;
        if ( typeof action !== "string" ) {
            options = action;
            toReturn = this.each( function( i, elem ) {
                if ( !$.data( elem, "plugin_" + pluginName ) ) {
                    $.data( elem, "plugin_" +
                        pluginName, new Plugin( elem, options ) );
                }
            } );
        } else {
            toReturn = this.map( function( i, elem ) {
                var plugin = $.data( elem, "plugin_" + pluginName );
                var tR;
                if ( !plugin ) {
                    plugin = new Plugin( elem, options );
                    $.data( elem, "plugin_" + pluginName, plugin );
                }
                if ( typeof plugin[ camelCase( action ) ] === "function" ) {
                    tR = plugin[ camelCase( action ) ]( options );
                }
                return tR;
            } ).get( );
            switch ( toReturn.length ) {
                case 0:
                    toReturn = null;
                    break;
                case 1:
                    toReturn = toReturn[ 0 ];
                    break;
                default:
            }
        }
        return toReturn;
    };
} )( jQuery, window, document );
