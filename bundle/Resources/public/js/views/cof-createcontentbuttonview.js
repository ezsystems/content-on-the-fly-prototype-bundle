/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('cof-createcontentbuttonview', function (Y) {
    'use strict';

    /**
     * Provides the Create Action view class
     *
     * @module cof-createcontentbuttonview
     */
    Y.namespace('cof');

    var SELECTOR_BTN_CREATE = '.cof-btn--create',
        EVENTS = {};

    EVENTS[SELECTOR_BTN_CREATE] = {'tap': '_showPopup'};

    /**
     * The Create Content Button View
     *
     * @namespace cof
     * @class createContentButtonView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.cof.CreateContentButtonView = Y.Base.create('createContentButtonView', Y.eZ.TemplateBasedView, [], {
        events: EVENTS,

        initializer: function () {
            this.get('createContentPopupView').on('displayedChange', this._toggleOverlay, this);
        },

        render: function () {
            this.get('container')
                .setHTML(this.template())
                .append(this.get('createContentPopupView').render().get('container'));

            return this;
        },

        /**
         * Shows the create content popup
         *
         * @protected
         * @method _showPopup
         */
        _showPopup: function () {
            this.get('createContentPopupView').set('displayed', true);
        },
    }, {
        ATTRS: {
            /**
             * The create content popup view instance
             *
             * @attribute createContentPopupView
             * @type cof.CreateContentPopupView
             */
            createContentPopupView: {
                valueFn: function () {
                    return new Y.cof.CreateContentPopupView({
                        bubbleTargets: this
                    });
                }
            },
        }
    });
});
