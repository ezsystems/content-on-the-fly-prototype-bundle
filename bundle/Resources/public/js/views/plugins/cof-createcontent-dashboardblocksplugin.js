/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('cof-createcontent-dashboardblocksplugin', function (Y) {
    'use strict';
    /**
     * Adds the create content button to the Dashboard Blocks View
     *
     * @module cof-dashboardblocks
     */

    Y.namespace('cof.Plugin');

    Y.cof.Plugin.DashboardBlocks = Y.Base.create('DashboardBlocks', Y.Plugin.Base, [], {
        initializer: function () {
            this.onHostEvent('activeChange', this._appendCreateButton, this);
        },

        /**
         * Appends the create button to the Universal Discovery Browse View
         *
         * @protected
         * @method _appendCreateButton
         */
        _appendCreateButton: function () {
            this.get('host')
                .get('container')
                .append(this.get('createContentButtonView').render().get('container'));
        }
    }, {
        NS: 'dashboardBlocks',

        ATTRS: {
            /**
             * The create content button view instance
             *
             * @attribute createContentButtonView
             * @type cof.CreateContentButtonView
             */
            createContentButtonView: {
                valueFn: function () {
                    return new Y.cof.CreateContentButtonView({
                        bubbleTargets: this.get('host'),
                    });
                }
            }
        }
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.cof.Plugin.DashboardBlocks, ['dashboardBlocksView']
    );
});
