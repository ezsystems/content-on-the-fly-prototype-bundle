/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('cof-createcontentpopupview', function (Y) {
    'use strict';

    /**
     * Provides the Create Content Popup View class
     *
     * @module cof-createcontentpopupview
     */
    Y.namespace('cof');

    var CLASS_HIDDEN = 'cof-is-hidden',
        CLASS_INDEX_RESET = 'cof-index-reset',
        SELECTOR_POPUP = '.cof-create-popup',
        SELECTOR_CLOSE_BUTTON = '.cof-btn--close',
        SELECTOR_VIEW_CONTAINER = '.ez-view-container',
        EVENTS = {};

    EVENTS[SELECTOR_CLOSE_BUTTON] = {'tap': '_close'};

    /**
     * The Create Content Popup view
     *
     * @namespace cof
     * @class CreateContentPopup
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.cof.CreateContentPopupView = Y.Base.create('createContentPopupView', Y.eZ.TemplateBasedView, [], {
        events: EVENTS,

        initializer: function () {
            this.after('displayedChange', this._toggleDisplay, this);
        },

        render: function () {
            var container = this.get('container');

            container.setHTML(this.template());
            container.one(SELECTOR_POPUP).append(this.get('contentCreationView').render().get('container'));

            return this._toggleDisplay();
        },

        /**
         * Shows/hides popup
         *
         * @method _toggleDisplay
         * @protected
         * @return {Y.cof.PopupView} the view itself
         */
        _toggleDisplay: function () {
            var isDisplayed = this.get('displayed'),
                toggleMethodName = isDisplayed ? 'removeClass' : 'addClass',
                zIndexMethodName = isDisplayed ? 'addClass' : 'removeClass';

            this.get('container')[toggleMethodName](CLASS_HIDDEN);
            Y.one(SELECTOR_VIEW_CONTAINER)[zIndexMethodName](CLASS_INDEX_RESET);

            this.get('contentCreationView').set('displayed', isDisplayed);

            return this;
        },

        /**
         * Closes popup
         *
         * @method _close
         * @param event {Object} event facade
         * @protected
         */
        _close: function (event) {
            event.preventDefault();

            this.set('displayed', false);
        },
    }, {
        ATTRS: {
            /**
             * The content creation view instance
             *
             * @attribute contentCreationView
             * @type cof.ContentCreationView
             */
            contentCreationView: {
                valueFn: function () {
                    return new Y.cof.ContentCreationView({
                        bubbleTargets: this,
                        finishBtnText: 'Finish',
                        closingDiscoveryWidgetPrevented: false,
                        redirectionPrevented: true
                    });
                }
            },

            /**
             * Displayed flag
             *
             * @attribute displayed
             * @default false
             * @type Boolean
             */
            displayed: {
                value: false
            },
        }
    });
});
