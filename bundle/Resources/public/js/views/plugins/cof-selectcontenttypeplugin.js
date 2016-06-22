/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('cof-selectcontenttypeplugin', function (Y) {
    'use strict';
    /**
     * Adds plugins to:
     * - the universal discovery view service
     *
     * @module cof-selectcontenttype
     */

    Y.namespace('cof.Plugin');

    Y.cof.Plugin.SelectContentType = Y.Base.create('selectContentType', Y.eZ.Plugin.ContentCreate, [], {
        initializer: function () {
            this.onHostEvent('*:fetchContentTypes', this._getContentTypes, this);
            this.onHostEvent('*:fetchSuggestedLocations', this._getSuggestedLocations, this);
        },

        /**
         * Get the suggested locations
         *
         * @protected
         * @method _getSuggestedLocations
         * @param event {Object} event facade
         */
        _getSuggestedLocations: function (event) {
            var contentTypeId = '/' + event.newVal.get('identifier'),
                host = this.get('host'),
                requestUrl = host.get('app').get('apiRoot') + 'api/ezp/v2/contentonthefly/locations' + contentTypeId;

            Y.io(requestUrl, {
                headers: {Accept: 'application/vnd.ez.api.LocationList+json'},
                on: {
                    success: Y.bind(function (id, xhr) {
                        this._loadLocations(JSON.parse(xhr.response).LocationList.Location)
                            .then(function (result) {
                                event.target.set('suggestedLocations', result);
                            })
                            .catch(function (error) {
                                /**
                                 * Displays a notification bar with error message.
                                 * Listened by eZ.PlatformUIApp
                                 *
                                 * @event notify
                                 * @param notification {Object} notification data
                                 */
                                host.fire('notify', {
                                    notification: {
                                        text: error.message || 'An unexpected error has occurred',
                                        identifier: 'error-load-locations',
                                        state: 'error',
                                        timeout: 0
                                    }
                                });
                            });
                    }, this)
                }
            });
        },

        /**
         * Loads suggested locations
         *
         * @protected
         * @method _loadLocations
         * @param locationsList {Array} the suggested locations list
         */
        _loadLocations: function (locationsList) {
            var capi = this.get('host').get('capi'),
                contentService = capi.getContentService(),
                promises = locationsList.map(function (location) {
                    return new Y.Promise(function (resolve, reject) {
                        contentService.loadLocation(location._href, function (error, response) {
                            var locationModel;

                            if (error) {
                                reject(error, response);

                                return;
                            }

                            locationModel = new Y.eZ.Location({
                                id: response.document.Location._href,
                                locationId: response.document.Location.id,
                                pathString: response.document.Location.pathString,
                                contentInfo: response.document.Location.ContentInfo
                            });

                            locationModel.loadPath({api: capi}, Y.bind(resolve, this, locationModel));
                        });
                    });
                });

            return Y.Promise.all(promises);
        },
    }, {
        NS: 'selectContentType'
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.cof.Plugin.SelectContentType, ['universalDiscoveryViewService', 'dashboardBlocksViewService']
    );
});
