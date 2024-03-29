/*
 *  inventory - v4.1.0
 *  A jump-start for jQuery plugins development.
 *
 *
 *  Made by JD-R2
 *  Under MIT License
 */
(function($, window, document, undefined) {
    "use strict";
    // Create the defaults once
    var pluginName = "inventory",
        defaults = {
            advancedSearch: false,
            title: "Listado del Inventario",
            jqgrid: {
                url: './ajaxinventorylist',
                loadonce: false,
                colNames: ["", "", "Sucursal", "", "Producto", "Existencia", "Mínimo", "Máximo", "Costo", "Precio", ""],
                colModel: [{
                        name: "id",
                        editable: false,
                        sortable: false,
                        hidden: true
                    },
                    {
                        name: "branchId",
                        editable: false,
                        sortable: false,
                        hidden: true
                    },
                    {
                        name: "branchName",
                        align: "left",
                        editable: false,
                        sorttype: latinize,
                        stype: "text",
                        width: 150,
                        searchoptions: {
                            sopt: ["eq", "ne", "bw", "bn", "ew", "en", "cn", "nc", "nu", "nn", "in", "ni"]
                        }
                    },
                    {
                        name: "productId",
                        editable: false,
                        sortable: false,
                        hidden: true
                    },
                    {
                        name: "productName",
                        align: "left",
                        editable: false,
                        sorttype: latinize,
                        stype: "text",
                        width: 150,
                        searchoptions: {
                            sopt: ["eq", "ne", "bw", "bn", "ew", "en", "cn", "nc", "nu", "nn", "in", "ni"]
                        }
                    },
                    {
                        name: "stockQuantity",
                        template: "number",
                        editable: true,
                        width: 90,
                        autoResizing: {
                            minColWidth: 50,
                            resetWidthOrg: false,
                            compact: false,
                            fixWidthOnShrink: true
                        }
                    },
                    {
                        name: "minQuantity",
                        template: "number",
                        editable: true,
                        width: 90,
                        autoResizing: {
                            minColWidth: 50,
                            resetWidthOrg: false,
                            compact: false,
                            fixWidthOnShrink: true
                        }
                    },
                    {
                        name: "maxQuantity",
                        template: "number",
                        editable: true,
                        width: 90,
                        autoResizing: {
                            minColWidth: 50,
                            resetWidthOrg: false,
                            compact: false,
                            fixWidthOnShrink: true
                        }
                    },
                    {
                        name: "cost",
                        formatter: "currency",
                        editable: true,
                        align: "right",
                        width: 90,
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
                            sopt: ["eq", "ne", "lt", "le", "gt", "ge"]
                        }
                    },
                    {
                        name: "publicPrice",
                        formatter: "currency",
                        editable: true,
                        align: "right",
                        width: 90,
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
                            sopt: ["eq", "ne", "lt", "le", "gt", "ge"]
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
                navOptions: {
                    reloadGridOptions: {
                        fromServer: true
                    }
                },
                altRows: true,
                autowidth: true,
                shrinkToFit: false,
                viewrecords: true,
                loadui: true,
                autoresizeOnLoad: false,
                cmTemplate: {
                    sortable: false,
                    autoResizable: true,
                    editable: true
                },
                guiStyle: "bootstrap",
                iconSet: "fontAwesome",
                rowNum: 10,
                autoResizing: {
                    compact: false
                },
                rowList: [10, 20, 50 /*, "10000:todos"*/ ],
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
                    groupField: ["sucursal"],
                    groupColumnShow: [true],
                    groupText: [""],
                    groupOrder: ["asc"],
                    groupSummary: [false],
                    groupSummaryPos: ["header"],
                    groupCollapse: true
                },
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
                    method: "POST",
                    async: true,
                    contentType: "application/json",
                    dataType: "json",
                    mimeType: "application/json"
                }
            },
            branches: {
                url: "./ajaxBranchSimpleCatalogRequest",
                method: "POST",
                async: true,
                contentType: "application/json",
                dataType: "json",
                mimeType: "application/json",
                data: "{ \"catalogName\":\"Cat_Branch\",\"language\": \"es\" }"
            }
        };
    // The actual plugin constructor
    function Plugin(element, options) {
        this.element = element;
        this.settings = $.extend(true, {}, defaults, {
            jqgrid: {
                ondblClickRow: ondblClickRow,
                onSelectRow: onSelectRow,
                serializeGridData: serializeGridData,
                loadError: loadError,
                beforeProcessing: beforeProcessing
            }
        }, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    function camelCase(string) {
        return string.replace(/-([a-z])/ig, function(all, letter) {
            return letter.toUpperCase();
        });
    }

    function onSelectRow(rowid, status, e) {
        var $self = $(this),
            savedRow = $self.jqGrid("getGridParam", "savedRow");
        if (savedRow.length > 0 && savedRow[0].id !== rowid) {
            $self.jqGrid("restoreRow", savedRow[0].id);
        }
    }

    function ondblClickRow(rowid, iRow, iCol, e) {
        var $self = $(this);
        $self.jqGrid("editRow", rowid, {
            focusField: e.target
        });
    }

    function beforeProcessing(response) {
        response.recordsFiltered = parseInt(response.recordsFiltered);
        var div = response.recordsFiltered / $(this).getGridParam('rowNum');
        response.total = Math.ceil(div);
    }

    function loadError(response, error, xhr) {
        console.log(error);
        console.log(response);
    }

    function serializeGridData(data) {
        var t1 = $("#branchesFilter").find("option:selected").val();
        var t2 = $("#productsFilter").val();
        $.extend(data, {
            "columns": [{
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
            }],
            "start": (data.draw - 1) * data.length,
            "search": {},
            "target1": t1 ? t1 : "",
            "target2": t2,
            "target3": ""
        });
        return JSON.stringify(data);
    }
    // Avoid Plugin.prototype conflicts
    $.extend(Plugin.prototype, {
        init: function() {
            var inventory = this;
            /**
             * initialize elements
             */
            var $container = $("<div>", { "class": "card-box inventory" });
            var $title = $("<h4>", {
                "class": "header-title m-t-0 m-b-30"
            }).text(inventory.settings.title);
            var $rowFilters = $("<div>", { "class": "row" });
            var $col4B = $("<div>", { "class": "form-group col-sm-4" });
            var $labelB = $("<label>", { for: "branchesFilter", "class": "control-label btn-block" }).text("Sucursales");
            var $selectBranchesFilter = $("<select>", { "class": "form-control", id: "branchesFilter" });
            var $col4P = $col4B.clone();
            var $labelP = $("<label>", { for: "productsFilter", "class": "control-label" }).text("Producto");
            var $inputProductsFilter = $("<input>", { type: "text", "class": "form-control", id: "productsFilter" });
            var $col4C = $("<div>", { "class": "form-group col-sm-1" });
            var $inputClearFilter = $("<button>", { type: "button", "class": "form-control btn btn-danger disabled", id: "clearFilter", title: "Limpiar filtros", disabled: "disabled", css: { marginTop: 25 } }).html("<i class='fa fa-filter-remove'></i>").click(function() { inventory.filterClear(); });
            var $grid = $("<table>");
            $container.append($title, $rowFilters, $grid);
            $rowFilters.append($col4B, $col4P, $col4C);
            $col4B.append($labelB, $selectBranchesFilter);
            $col4P.append($labelP, $inputProductsFilter);
            $col4C.append($inputClearFilter);
            $(inventory.element).append($container);
            inventory.$grid = $grid;
            inventory.$selectBranchesFilter = $selectBranchesFilter;
            inventory.$inputProductsFilter = $inputProductsFilter;
            inventory.$inputClearFilter = $inputClearFilter;
            //$selectBranchesFilter.select2( inventory.settings.select2 );
            $.ajax(inventory.settings.branches).done(function(data) {
                if (typeof data.Cat_Branch === "undefined") {
                    $(inventory.element).trigger("inventory.branchesError", data);
                    return;
                }
                $selectBranchesFilter.append($("<option>", { value: 0 }).text("Todas"));
                $.each(data.Cat_Branch, function(i, elem) {
                    var option = $("<option>", { value: elem.id }).text(elem.value);
                    $selectBranchesFilter.append(option);
                });
            });
            $grid.jqGrid(inventory.settings.jqgrid)
                .jqGrid("gridResize").jqGrid("bindKeys")
                .jqGrid("navGrid", {
                    edit: false,
                    add: false,
                    del: false,
                    search: inventory.settings.advancedSearch,
                    refresh: true
                }, {}, {}, {}, {
                    closeAfterSearch: true,
                    multipleSearch: true,
                    multipleGroup: true
                });
            /**
             * Events
             */
            $inputProductsFilter.on("keyup", function() {
                if (!inventory.keyupDelay) {
                    inventory.keyupDelay = setTimeout(function() {
                        var st = $inputProductsFilter.val();
                        inventory.filterByProducts(st);
                        inventory.keyupDelay = false;
                    }, 1000);
                }
                return false;
            });
            $selectBranchesFilter.on("change", function(e) {
                var $selector = $(this);
                var branches = $selector.find("option:selected").text();
                inventory.filterByBranches(branches);
                return false;
            });
            $(".ui-jqgrid-title").click(function() {
                $(this).parent().find(".ui-jqgrid-titlebar-close").click();
            });
            $(".ui-jqgrid-titlebar-close, .ui-pg-button").click(function() {
                setTimeout(function() {
                    $(window).resize();
                }, 200);
            });
            $grid.on("jqGridInlineAfterSaveRow", function(e, rowID) {
                var data = $grid.jqGrid("getRowData", rowID);
                $(inventory.element).trigger("inventory.saveRow", data);
            });
            $grid.on("jqGridInlineEditRow", function(e, rowid, iRow) {
                $("#" + rowid).find("input, select").addClass("form-control");
            });
            $(window).resize(function() {
                if (!inventory.resizeDelay) {
                    inventory.resizeDelay = setTimeout(function() {
                        var s = $grid.closest(".ui-jqgrid").parent().width();
                        if (s > 610) {
                            if (!$grid.jqGrid("getGridParam", "shrinkToFit")) {
                                $grid.jqGrid("setGridParam", { shrinkToFit: true });
                            }
                        } else {
                            if ($grid.jqGrid("getGridParam", "shrinkToFit")) {
                                $grid.jqGrid("setGridParam", { shrinkToFit: false });
                            }
                        }
                        $grid.jqGrid("setGridWidth", s);
                        inventory.resizeDelay = false;
                    }, 500);
                }
            }).trigger("resize");
            $grid.on("jqGridFilterBeforeShow", function(e, $form) {
                $form.closest(".ui-jqdialog").addClass("inventory");
            });
            $grid.on("jqGridFilterReset", function(e) {
                //.closest(".modal").modal('toggle');
            });
            $grid.on("jqGridBeforeRequest", function() {
                if (!inventory.$grid.jqGrid("getGridParam", "search")) {
                    inventory.filterDomClear();
                }
            });
        },
        filterGet: function() {
            var postData = this.$grid.jqGrid("getGridParam", "postData"),
                filters;
            try {
                filters = JSON.parse(postData.filters);
            } catch (e) {
                return false;
            }
            if (typeof filters.groups !== "object") {
                filters.groups = [];
            }
            return filters;
        },
        filterObj: function() {
            return {
                groupOp: "AND",
                groups: []
            };
        },
        filterSet: function(filters) {
            /*var old = this.filterGet();
      if (old) {
          filters = $.extend(true, {}, old, filters);
}*/
            var postData = this.$grid.jqGrid("getGridParam", "postData");
            postData.filters = JSON.stringify(filters);
            this.$grid.jqGrid("setGridParam", {
                search: true
            });
            this.$grid.trigger("reloadGrid", [{
                page: 1,
                current: true
            }]);
            this.$inputClearFilter.removeClass("disabled").prop("disabled", false);
            return true;
        },
        filterClear: function() {
            this.filterDomClear();
            var postData = this.$grid.jqGrid("getGridParam", "postData");
            postData.filters = "";
            this.$grid.jqGrid("setGridParam", {
                search: false
            });
            this.$grid.trigger("reloadGrid", [{
                page: 1,
                current: true
            }]);
            return true;
        },
        filterDomClear: function() {
            this.$inputProductsFilter.val("");
            this.$selectBranchesFilter.val(null).trigger("change");
            this.$inputClearFilter.addClass("disabled").prop("disabled", true);
        },
        filterByProducts: function(searchText) {
            var filters = this.filterGet();
            if (!filters) {
                filters = this.filterObj();
            }
            var branchesObj = filters.groups.filter(function(elem) {
                if (elem.criteria === "products") {
                    elem.rules = [{
                        field: "producto",
                        op: "cn",
                        data: searchText
                    }];
                    return elem;
                }
            });
            if (branchesObj.length < 1) {
                filters.groups.push({
                    criteria: "products",
                    groupOp: "OR",
                    rules: [{
                        field: "producto",
                        op: "cn",
                        data: searchText
                    }]
                });
            }
            this.filterSet(filters);
            return true;
        },
        filterRmProduct: function() {
            var filters = this.filterGet();
            if (!filters) {
                return true;
            }
            filters = filters.groups.filter(function(elem) {
                if (elem.criteria === "products") {
                    return;
                }
                return elem;
            });
            this.filterSet(filters);
            return true;
        },
        filterByBranches: function(toSearch) {
            var filters = this.filterGet(),
                rules = [];
            if (!filters) {
                filters = this.filterObj();
            }
            rules.push({
                field: "sucursal",
                op: "eq",
                data: toSearch
            });
            var branchesObj = filters.groups.filter(function(elem) {
                if (elem.criteria === "branches") {
                    elem.rules = rules;
                    return elem;
                }
            });
            if (branchesObj.length < 1) {
                filters.groups.push({
                    criteria: "branches",
                    groupOp: "OR",
                    rules: rules
                });
            }
            this.filterSet(filters);
            return true;
        },
        filterRmBranches: function() {
            var filters = this.filterGet();
            if (!filters) {
                return true;
            }
            filters = filters.groups.filter(function(elem) {
                if (elem.criteria === "branches") {
                    return;
                }
                return elem;
            });
            this.filterSet(filters);
            return true;
        },
        help: function() {
            var funcs = $.map(this, function(elem, i) {
                if (typeof elem === "function") {
                    return i;
                }
            });
            console.log("defaults");
            console.log(defaults);
            console.log("métodos disponibles");
            console.log(funcs);
            console.log("------------");
            return [JSON.stringify(defaults), JSON.stringify(funcs)];
        }
    });
    // preventing against multiple instantiations,
    // allowing set an action to do at the initialization
    $.fn[pluginName] = function(action, options) {
        var toReturn;
        if (typeof action !== "string") {
            options = action;
            toReturn = this.each(function(i, elem) {
                if (!$.data(elem, "plugin_" + pluginName)) {
                    $.data(elem, "plugin_" +
                        pluginName, new Plugin(elem, options));
                }
            });
        } else {
            toReturn = this.map(function(i, elem) {
                var plugin = $.data(elem, "plugin_" + pluginName);
                var tR;
                if (!plugin) {
                    plugin = new Plugin(elem, options);
                    $.data(elem, "plugin_" + pluginName, plugin);
                }
                if (typeof plugin[camelCase(action)] === "function") {
                    tR = plugin[camelCase(action)](options);
                }
                return tR;
            }).get();
            switch (toReturn.length) {
                case 0:
                    toReturn = null;
                    break;
                case 1:
                    toReturn = toReturn[0];
                    break;
                default:
            }
        }
        return toReturn;
    };
})(jQuery, window, document);