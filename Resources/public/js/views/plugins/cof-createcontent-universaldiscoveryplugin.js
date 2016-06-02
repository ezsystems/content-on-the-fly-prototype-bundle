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

    var CLASS_HIDDEN = 'cof-is-hidden',
        SELECTOR_TAB_CREATE = '[href="#ez-ud-create"]',
        SELECTOR_TAB_LABEL = '.ez-tabs-label';

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
            var host = this.get('host');

            host.get('methods').push(this.get('tabCreateView'));

            host.on('*:saveDiscoveryState', this._saveDiscoveryWidgetState, this);
            host.on('*:restoreDiscoveryWidget', this._restoreDiscoveryWidgetState, this);
            host.on('activeChange', this._toggleTabCreateVisibility, this);
        },

        /**
         * Saves the current state of Discovery Widget.
         *
         * @protected
         * @method _saveDiscoveryState
         * @param event {Object} event facade
         */
        _saveDiscoveryWidgetState: function (event) {
            event.target.set('savedDiscoveryState', this.get('host').getAttrs());
        },

        /**
         * Restores state of Discovery Widget.
         *
         * @protected
         * @method _restoreDiscoveryWidgetState
         * @param event {Object} event facade
         */
        _restoreDiscoveryWidgetState: function (event) {
            var host = this.get('host'),
                savedDiscoveryState = event.target.get('savedDiscoveryState');

            host.setAttrs(savedDiscoveryState);
            host._set('selection', savedDiscoveryState.selection);
        },

        /**
         * Toggles visibility of the create tab.
         *
         * @protected
         * @method _toggleTabCreateVisibility
         */
        _toggleTabCreateVisibility: function () {
            var host = this.get('host'),
                tabCreateLabel = host.get('container').one(SELECTOR_TAB_CREATE).ancestor(SELECTOR_TAB_LABEL);

            if (host.get('hideTabCreate')) {
                tabCreateLabel.addClass(CLASS_HIDDEN);

                host.set('hideTabCreate', false);
            } else {
                tabCreateLabel.removeClass(CLASS_HIDDEN);
            }
        }
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
                    var host = this.get('host');

                    return new Y.cof.UniversalDiscoveryCreateView({
                        bubbleTargets: host,
                        priority: 300,
                        isAlreadySelected: Y.bind(host._isAlreadySelected, host)
                    });
                }
            }
        }
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.cof.Plugin.CreateContentUniversalDiscovery, ['universalDiscoveryView']
    );
});
