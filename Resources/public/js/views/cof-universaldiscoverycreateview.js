/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('cof-universaldiscoverycreateview', function (Y) {
    'use strict';
    /**
     * Provides the universal discovery create method
     *
     * @module cof-universaldiscoverycreateview
     */
    Y.namespace('cof');

    /**
     * The universal discovery create method view. It allows the user to create
     * content in the repository.
     *
     * @namespace cof
     * @class UniversalDiscoveryCreateView
     * @constructor
     * @extends eZ.UniversalDiscoveryMethodBaseView
     */
    Y.cof.UniversalDiscoveryCreateView = Y.Base.create('UniversalDiscoveryCreateView', Y.eZ.UniversalDiscoveryMethodBaseView, [], {
        initializer: function () {
            this.on('visibleChange', this._toggleContentCreationVisibility, this);
        },

        render: function () {
            this.get('container').append(this.get('contentCreationView').render().get('container'));

            return this;
        },

        /**
         * Toggles the content creation visibility.
         *
         * @protected
         * @method _toggleContentCreationVisibility
         * @param event {Object} event facade
         */
        _toggleContentCreationVisibility: function (event) {
            this.get('contentCreationView').set('displayed', event.newVal);
        },
    }, {
        ATTRS: {
            /**
             * Holds the content creation view instance
             *
             * @attribute contentCreationView
             * @type cof.ContentCreationView
             */
            contentCreationView: {
                valueFn: function () {
                    return new Y.cof.ContentCreationView({
                        bubbleTargets: this
                    });
                }
            },

            /**
             * Flag indicating whether the user is able to select multiple
             * content items.
             *
             * @attribute multiple
             * @type Boolean
             * @default false
             * @readOnly
             */
            multiple: {
                value: false,
                readOnly: true
            },

            /**
             * Flag indicating whether the Content should be provided in the
             * selection.
             *
             * @attribute loadContent
             * @type Boolean
             * @default false
             * @readOnly
             */
            loadContent: {
                value: false,
                readOnly: true
            },

            /**
             * Title of the view
             *
             * @attribute title
             * @type String
             * @default 'Create'
             * @readOnly
             */
            title: {
                value: 'Create',
                readOnly: true,
            },

            /**
             * Identifier of the view
             *
             * @attribute identifier
             * @type String
             * @default 'create'
             * @readOnly
             */
            identifier: {
                value: 'create',
                readOnly: true,
            },
        },
    });
});
