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

    Y.cof.Plugin.CreateContentUniversalDiscoveryService = Y.Base.create('CreateContentUniversalDiscoveryServicePlugin', Y.eZ.Plugin.ViewServiceBase, [Y.eZ.Plugin.PublishDraft], {
        initializer: function () {
            /**
             * Stores the attributes of saved discovery widget
             *
             * @property _savedDiscoveryAttributes
             * @type {Object}
             * @protected
             */
            this._savedDiscoveryAttributes = null;

            this.onHostEvent('*:openUniversalDiscoveryWidget', this._openUniversalDiscoveryWidget, this);
            this.onHostEvent('*:prepareContentModel', this._loadContentTypeData, this);
            this.onHostEvent('*:setParentLocation', this._setParentLocation, this);
            this.onHostEvent('*:publishedDraft', this._loadContentLocation, this);
            this.onHostEvent('*:deleteContent', this._deleteContent, this);
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
                    isSelectable: function (contentStruct) {
                        return contentStruct.contentType.get('isContainer');
                    },
                    forceVisibleMethod: true,
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

            if (target.get('closingDiscoveryWidgetPrevented')) {
                event.preventDefault();
                event.stopPropagation();
            }

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

            this._savedDiscoveryAttributes = target.get('savedDiscoveryState');

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
            app.fire('contentDiscover', {config: {}});
        },

        /**
         * Loads the content type data.
         *
         * @protected
         * @method _loadContentTypeData
         * @param event {Object} event facade
         */
        _loadContentTypeData: function (event) {
            var type = event.contentType,
                host = this.get('host');

            type.load({api: host.get('capi')}, Y.bind(function (error) {
                if (error) {
                    /**
                     * Displays a notification bar with error message.
                     * Listened by eZ.PlatformUIApp
                     *
                     * @event notify
                     * @param notification {Object} notification data
                     */
                    host.fire('notify', {
                        notification: {
                            text: "Could not load the content type with id '" + type.get('id') + "'",
                            identifier: 'loading-content-type-error',
                            state: 'error',
                            timeout: 0
                        }
                    });

                    return;
                }

                this._setContentTypeData(event);
            }, this));
        },

        /**
         * Sets the data required to create new content
         *
         * @method _setContentTypeData
         * @protected
         * @param event {Object} event facade
         */
        _setContentTypeData: function (event) {
            var content = new Y.eZ.Content(),
                version = new Y.eZ.Version(),
                type = event.contentType,
                mainLanguageCode = type.get('mainLanguageCode'),
                host = this.get('host'),
                user = host.get('app').get('user'),
                target = event.target,
                defaultFields = {};

            content.set('name', 'New "' + type.get('names')[mainLanguageCode] + '"');

            Y.Object.each(type.get('fieldDefinitions'), function (fieldDef, identifier) {
                defaultFields[identifier] = {
                    fieldDefinitionIdentifier: identifier,
                    fieldValue: fieldDef.defaultValue,
                };
            });

            host.setAttrs({
                content: content,
                version: version,
                languageCode: mainLanguageCode,
                contentType: type,
                eventTarget: target
            });

            target.setAttrs({
                content: content,
                version: version,
                languageCode: mainLanguageCode,
                owner: user,
                user: user
            });

            target.get('content').set('fields', defaultFields);
            target.get('version').set('fields', defaultFields);
        },

        /**
         * Sets the parent location
         *
         * @method _setParentLocation
         * @protected
         * @param event {Object} event facade
         */
        _setParentLocation: function (event) {
            this.get('host').set('parentLocation', event.selectedLocation);
        },

        /**
         * Loads the content location of the published content
         *
         * @method _loadContentLocation
         * @protected
         * @param event {Object} event facade
         */
        _loadContentLocation: function (event) {
            var udwService = this.get('host'),
                selection = {
                    contentType: udwService.get('contentType'),
                },
                mainLocation = new Y.eZ.Location();

            selection.content = event.content;

            mainLocation.set('id', event.content.get('resources').MainLocation);
            mainLocation.load({api: udwService.get('capi')}, function (error) {
                selection.location = mainLocation;
                selection.contentInfo = mainLocation.get('contentInfo');

                udwService.get('app').set('loading', false);
                udwService.get('eventTarget').fire('contentLoaded', selection);
            });
        },

        /**
         * Sets the contentType, languageCode, parentLocation and parentContent on the next
         * view service if the users wants to create a new content
         *
         * @method setNextViewServiceParameters
         * @param {eZ.ViewService} service
         */
        setNextViewServiceParameters: function (service) {
            var host = this.get('host'),
                content = host.get('content'),
                languageCode = host.get('languageCode');

            if (content && !content.get('mainLanguageCode')) {
                content.set('mainLanguageCode', languageCode);
            }

            if (host.get('parentLocation') && service instanceof Y.eZ.ContentCreateViewService) {
                service.setAttrs({
                    parentLocation: host.get('parentLocation'),
                    parentContent: content,
                    contentType: host.get('contentType'),
                    languageCode: languageCode
                });
            }
        },

        /**
         * Deletes given content.
         *
         * @method _deleteContent
         * @param event {Object} event facade
         * @param event.content {Object} the content
         */
        _deleteContent: function (event) {
            event.content.delete({api: this.get('host').get('capi')}, function () {});
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
        Y.cof.Plugin.CreateContentUniversalDiscoveryService, ['universalDiscoveryViewService', 'dashboardBlocksViewService']
    );
});
