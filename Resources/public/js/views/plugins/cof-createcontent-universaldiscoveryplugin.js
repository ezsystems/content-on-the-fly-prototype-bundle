/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('cof-createcontent-universaldiscoveryplugin', function (Y) {
    'use strict';
    /**
     * Provides the Content on the Fly plugin for Universal Discovery Widget View
     *
     * @module cof-universaldiscoverywidgetplugin
     */
    Y.namespace('cof.Plugin');

    /**
     * Content on the Fly plugin. Extends the Universal Discovery Widget View
     *
     * @namespace cof.Plugin
     * @class CreateContentUniversalDiscoveryWidgetPlugin
     * @constructor
     * @extends Plugin.Base
     */
    Y.cof.Plugin.CreateContentUniversalDiscovery = Y.Base.create('CreateContentUniversalDiscoveryWidgetPlugin', Y.Plugin.Base, [], {
        initializer: function () {
            this.get('host').get('methods').push(this.get('tabCreateView'));
        },
    }, {
        NS: 'createContentUniversalDiscoveryWidgetPlugin',
        ATTRS: {
            /**
             * Holds the universal discovery create view instance
             * to be used as a tab in the Universal Discovery Widget
             *
             * @attribute tabCreateView
             * @type Y.cof.UniversalDiscoveryCreateView
             */
            tabCreateView: {
                valueFn: function () {
                    return new Y.cof.UniversalDiscoveryCreateView({
                        bubbleTargets: this.get('host'),
                        priority: 300,
                        isAlreadySelected: Y.bind(this.get('host')._isAlreadySelected, this.get('host'))
                    });
                }
            }
        }
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.cof.Plugin.CreateContentUniversalDiscovery, ['universalDiscoveryView']
    );
});
