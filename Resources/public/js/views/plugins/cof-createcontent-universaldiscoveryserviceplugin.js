/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('cof-createcontent-universaldiscoveryserviceplugin', function (Y) {
    'use strict';
    /**
     * Adds plugins to:
     * - the universal discovery view service
     *
     * @module cof-createcontent-universaldiscoveryservice
     */

    Y.namespace('cof.Plugin');

    Y.cof.Plugin.CreateContentUniversalDiscoveryService = Y.Base.create('CreateContentUniversalDiscoveryServicePlugin', Y.eZ.Plugin.ViewServiceBase, [], {
        initializer: function () {
            this.onHostEvent('*:openUniversalDiscoveryWidget', this._openUniversalDiscoveryWidget, this);
        },

        /**
         * Opens a new Discovery Widget.
         *
         * @protected
         * @method _saveDiscoveryState
         * @param event {Object} event facade
         */
        _openUniversalDiscoveryWidget: function (event) {
            var app = this.get('host').get('app'),
                target = event.target;

            target.set('restoreFormState', true);
            target.set('displayed', false);

            /**
             * Close the universal discovery widget.
             * Listened by eZ.PlatformUIApp
             *
             * @event cancelDiscover
             */
            app.fire('cancelDiscover');
            /**
             * Open the universal discovery widget.
             * Listened by eZ.PlatformUIApp
             *
             * @event contentDiscover
             * @param config {Object} config of the universal discovery widget
             */
            app.fire('contentDiscover', {
                config: {
                    title: this.get('discoveryWidgetTitle'),
                    multiple: false,
                    contentDiscoveredHandler: Y.bind(this._setSelectedLocation, this, target),
                    isSelectable: function () {return true;},
                    visibleMethod: 'browse',
                    hideTabCreate: true
                },
            });
        },

        /**
         * Sets the selected location.
         *
         * @protected
         * @method _setSelectedLocation
         * @param target {Y.View} target where set selected location
         * @param event {Object} event facade
         */
        _setSelectedLocation: function (target, event) {
            var host = this.get('host'),
                app = host.get('app');

            event.preventDefault();
            event.stopPropagation();

            event.selection.location.loadPath({api: host.get('capi')}, Y.bind(function (error, path) {
                if (error) {
                    /**
                     * Displays a notification bar with error message.
                     * Listened by eZ.PlatformUIApp
                     *
                     * @event notify
                     * @param notification {Object} notification data
                     */
                    target.fire('notify', {
                        notification: {
                            text: this.get('notificationErrorText'),
                            identifier: 'loading-path-error',
                            state: 'error',
                            timeout: 0
                        }
                    });

                    return;
                }

                target.set('selectedLocation', event.selection);
            }, this));

            target.set('displayed', true);

            /**
             * Fired to restore the universal discovery state.
             * Listened by cof.Plugin.CreateContentUniversalDiscovery
             *
             * @event restoreDiscoveryWidget
             */
            target.fire('restoreDiscoveryWidget');

            /**
             * Close the universal discovery widget.
             * Listened by eZ.PlatformUIApp
             *
             * @event cancelDiscover
             */
            app.fire('cancelDiscover');
            /**
             * Open the universal discovery widget.
             * Listened by eZ.PlatformUIApp
             *
             * @event contentDiscover
             */
            app.fire('contentDiscover');
        },
    }, {
        NS: 'CreateContentUniversalDiscoveryServicePlugin',
        ATTRS: {
            /**
             * The title of the Universal Discovery Widget
             *
             * @attribute discoveryWidgetTitle
             * @type String
             * @default 'Select the location for your content'
             */
            discoveryWidgetTitle: {
                value: 'Select the location for your content'
            },

            /**
             * The text for the notification error
             *
             * @attribute notificationErrorText
             * @type String
             * @default 'An error occured when getting the location path'
             */
            notificationErrorText: {
                value: 'An error occured when getting the location path'
            }
        }
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.cof.Plugin.CreateContentUniversalDiscoveryService, ['universalDiscoveryViewService']
    );
});
