/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('cof-contentcreationview', function (Y) {
    'use strict';

    /**
     * Provides the Content Creation View class
     *
     * @module cof-contentcreationview
     */
    Y.namespace('cof');

    var CLASS_HIDDEN = 'cof-is-hidden',
        CLASS_LOADING = 'is-loading',
        CLASS_CONTENT_CREACTION = 'cof-content-creation',
        CLASS_BUTTON = 'cof-btn',
        CLASS_BUTTON_DISABLED = CLASS_BUTTON + '--disabled',
        CLASS_ON_PAGE_TWO = 'on-page-two',
        SELECTOR_CONTENT_CREACTION = '.' + CLASS_CONTENT_CREACTION,
        SELECTOR_BUTTON = '.' + CLASS_BUTTON,
        SELECTOR_NEXT_BUTTON = SELECTOR_BUTTON + '--next',
        SELECTOR_BACK_BUTTON = SELECTOR_BUTTON + '--back',
        SELECTOR_FINISH_BUTTON = SELECTOR_BUTTON + '--finish',
        SELECTOR_CONTENT_TYPE =SELECTOR_CONTENT_CREACTION +  '__content-type-selector',
        SELECTOR_CHANGE_CONTENT_TYPE = SELECTOR_BUTTON + '--change-content-type',
        SELECTOR_ITEM_SELECTED = '.ez-selection-filter-item-selected',
        TOOLTIP = '<div class="cof-content-creation__tooltip cof-is-hidden"></div>',
        SELECTOR_EDIT_LOCATION_BUTTON = SELECTOR_BUTTON +  '--edit-location',
        SELECTOR_LOCATION = SELECTOR_CONTENT_CREACTION + '__location',
        SELECTOR_CONTENT_CREATOR = SELECTOR_CONTENT_CREACTION + '__creator',
        ATTR_DESCRIPTION = 'data-description',
        ATTR_ACTION = 'data-action',
        SELECTOR_ACTION = '[' + ATTR_ACTION + ']',
        TEXT_PUBLISH = 'publish',
        EVENTS = {};

    EVENTS[SELECTOR_NEXT_BUTTON] = {'tap': '_changeFormPage'};
    EVENTS[SELECTOR_BACK_BUTTON] = {'tap': '_changeFormPage'};
    EVENTS[SELECTOR_FINISH_BUTTON] = {'tap': '_renderCreateContent'};
    EVENTS[SELECTOR_CHANGE_CONTENT_TYPE] = {'tap': '_changeFormPage'};
    EVENTS[SELECTOR_EDIT_LOCATION_BUTTON] = {'tap': '_openDiscoveryWidget'};

    /**
     * The Content Creation view
     *
     * @namespace cof
     * @class ContentCreationView
     * @constructor
     * @extends eZ.TemplateBasedView
     */
    Y.cof.ContentCreationView = Y.Base.create('ContentCreationView', Y.eZ.TemplateBasedView, [], {
        events: EVENTS,

        initializer: function () {
            this.on('displayedChange', this._getContentTypes, this);
            this.on('contentTypeGroupsChange', this._renderContentTypeSelector, this);
            this.on('*:itemSelected', this._enableNextButton, this);
            this.on('*:itemSelected', this._toggleTooltip, this);
            this.on('selectedLocationChange', this._updateSelectedLocation, this);
            this.on('*:contentLoaded', this._hideCreateContentView, this, true);
            this.on('*:closeView', this._hideCreateContentView, this, false);
        },

        render: function () {
            this.get('container').setHTML(this.template({
                finishBtnText: this.get('finishBtnText')
            }));

            return this;
        },

        /**
         * Toggles the tooltip visibility
         *
         * @protected
         * @method _toggleTooltip
         */
        _toggleTooltip: function () {
            var selectedItem = this.get('container').one(SELECTOR_ITEM_SELECTED),
                contentTypeSelectorView = this.get('contentTypeSelectorView');

            if (selectedItem && selectedItem.getAttribute(ATTR_DESCRIPTION)) {
                contentTypeSelectorView.showTooltip();
            } else {
                contentTypeSelectorView.hideTooltip();
            }
        },

        /**
         * Enables the next button
         *
         * @protected
         * @method _enableNextButton
         * @param event {Object} event facade
         * @param event.text {String} the selected content type name
         */
        _enableNextButton: function (event) {
            var container = this.get('container');

            container.one(SELECTOR_CHANGE_CONTENT_TYPE).setHTML(event.text);
            container.one(SELECTOR_NEXT_BUTTON).removeClass(CLASS_BUTTON_DISABLED);
        },

        /**
         * Enable the finish button when user select location
         *
         * @protected
         * @method _enableFinishButton
         */
        _enableFinishButton: function () {
                this.get('container').one(SELECTOR_FINISH_BUTTON).removeClass(CLASS_BUTTON_DISABLED);
        },

        /**
         * Gets the Content Types
         *
         * @protected
         * @method _getContentTypes
         * @param event {Object} event facade
         */
        _getContentTypes: function (event) {
            var eventNewVal = event.newVal,
                container = this.get('container'),
                restoreFormState = this.get('restoreFormState');


            if (!eventNewVal && !restoreFormState) {
                this._resetFormState();

                return;
            } else if (eventNewVal && restoreFormState) {
                this.set('restoreFormState', false);

                return;
            } else if (restoreFormState) {
                return;
            }

            this.get('contentTypeSelectorView').hideTooltip();

            container.one(SELECTOR_CONTENT_TYPE).addClass(CLASS_LOADING);
            container.one(SELECTOR_NEXT_BUTTON).addClass(CLASS_BUTTON_DISABLED);

            /**
             * Fetches the content types data.
             * Listened in the cof.Plugin.createContentSelectContentType
             */
            this.fire('fetchContentTypes');
        },

        /**
         * Resets the content creation form state
         *
         * @protected
         * @method _resetFormState
         */
        _resetFormState: function () {
            this.set('activePage', 0);

            this.get('container').removeClass(CLASS_ON_PAGE_TWO);
        },

        /**
         * Render the Content Type Selector View.
         *
         * @protected
         * @method _renderContentTypeSelector
         * @param event {Object} event facade
         */
        _renderContentTypeSelector: function (event) {
            var selectorContainer = this.get('container').one(SELECTOR_CONTENT_TYPE),
                contentTypeSelectorView = this.get('contentTypeSelectorView');

            contentTypeSelectorView.set('contentTypeGroups', event.newVal);

            selectorContainer.append(contentTypeSelectorView.render().get('container').append(TOOLTIP));
            selectorContainer.removeClass(CLASS_LOADING);
        },

        /**
         * Changes the page of the Content Creation Widget.
         *
         * @protected
         * @method _changeFormPage
         * @param event {Object} event facade
         */
        _changeFormPage: function (event) {
            var activePage = this.get('activePage'),
                onPageTwoMethodName = activePage ? 'removeClass' : 'addClass',
                tooltipMethodName = activePage ? 'showTooltip' : 'hideTooltip';

            if (event && event.target.hasClass(CLASS_BUTTON_DISABLED)) {
                return;
            }

            this.get('container')[onPageTwoMethodName](CLASS_ON_PAGE_TWO);

            this.get('contentTypeSelectorView')[tooltipMethodName]();

            this.set('activePage', activePage ? 0 : 1);
        },

        /**
         * Fires event to save the current state of Discovery Widget and open new Discovery Widget.
         *
         * @protected
         * @method _openDiscoveryWidget
         */
        _openDiscoveryWidget: function () {
            /**
             * Fired to save the current state of Discovery Widget.
             * Listened in the cof.Plugin.CreateContentUniversalDiscovery
             *
             */
            this.fire('saveDiscoveryState');
            /**
             * Fired to open new Discovery Widget.
             * Listened in the cof.Plugin.createContentSelectContentType
             *
             */
            this.fire('openUniversalDiscoveryWidget');
        },

        /**
         * Updates the selected location to creating content.
         *
         * @protected
         * @method _updateSelectedLocation
         * @param event {Object} event facade
         */
        _updateSelectedLocation: function (event) {
            var eventNewVal = event.newVal,
                locationPath = eventNewVal.location.get('path'),
                contentInfo = eventNewVal.contentInfo,
                selectedName = contentInfo.get('name'),
                pathSeparator = '/',
                selectedPath = pathSeparator;

            locationPath.forEach(function (location) {
                selectedPath += location.get('contentInfo').get('name') + pathSeparator;
            });

            selectedPath += selectedName;

            this.get('container').one(SELECTOR_LOCATION).setHTML(selectedPath);

            /**
             * Fired to set selected location where place the new content.
             * Listened in the eZS.Plugin.UniversalDiscoveryWidgetService
             *
             */
            this.fire('setParentLocation', {selectedLocation: eventNewVal.location});

            this._enableFinishButton();
        },

        /**
         * Render the create content view.
         *
         * @protected
         * @method _renderCreateContent
         * @param event {Object} event facade
         */
        _renderCreateContent: function (event) {
            var container = this.get('container'),
                CreateContentConstructor = this.get('createContentView'),
                contentTypeSelector = this.get('contentTypeSelectorView'),
                createContentView;

            if (event.target.hasClass(CLASS_BUTTON_DISABLED)) {
                return;
            }

            createContentView = new CreateContentConstructor({
                content: contentTypeSelector.get('content'),
                version: contentTypeSelector.get('version'),
                mainLocation: this.get('selectedLocation').location,
                contentType: contentTypeSelector.get('selectedContentType'),
                owner: contentTypeSelector.get('owner'),
                user: contentTypeSelector.get('user'),
                languageCode: contentTypeSelector.get('languageCode')
            });

            createContentView.addTarget(this);

            container.one(SELECTOR_CONTENT_CREATOR)
                     .setHTML(createContentView.render().get('container'))
                     .removeClass(CLASS_HIDDEN);

            createContentView.set('active', true);

            this._hideButtons(createContentView);
        },

        /**
         * Hides buttons besides publish.
         *
         * @protected
         * @method _hideButtons
         * @param view {Object} the view instance
         */
        _hideButtons: function (view) {
            var buttons = view.get('container').all(SELECTOR_ACTION).getDOMNodes();

            buttons.forEach(function (button) {
                if (button.getAttribute(ATTR_ACTION) !== TEXT_PUBLISH) {
                    button.classList.add(CLASS_HIDDEN);
                }
            });
        },

        /**
         * Hides the create content view.
         *
         * @protected
         * @method _hideCreateContentView
         * @param event {Object} event facade
         * @param event {Boolean} should hide the widget?
         */
        _hideCreateContentView: function (event, hideWidget) {
            var container = this.get('container');

            container.one(SELECTOR_CONTENT_CREATOR).addClass(CLASS_HIDDEN);

            if (hideWidget) {
                this.set('displayed', false);
            }
        },
    }, {
        ATTRS: {
            /**
             * The Content Creation Widget Content Type Selector view instance
             *
             * @attribute contentTypeSelectorView
             * @type Y.View
             */
            contentTypeSelectorView: {
                valueFn: function () {
                    return new Y.cof.ContentTypeSelectorView({
                        bubbleTargets: this
                    });
                }
            },

            /**
             * The Content Edit View
             *
             * @attribute createContentView
             * @type String
             */
            createContentView: {
                value: Y.eZ.ContentEditView
            },

            /**
             * Which page is active:
             * 0 - first
             * 1 - second
             *
             * @attribute activePage
             * @type Number
             * @default 0
             */
            activePage: {
                value: 0
            },

            /**
             * The finish button text
             *
             * @attribute finishBtnText
             * @type String
             * @default 'Confirm selection'
             */
            finishBtnText: {
                value: 'Confirm selection'
            },

            /**
             * Is view expanded?
             *
             * @attribute expanded
             * @type Boolean
             * @default true
             * @readOnly
             */
            expanded: {
                value: true,
                readOnly: true
            },

            /**
             * Should restore the widget state
             *
             * @attribute restoreFormState
             * @type Boolean
             * @default 'False'
             */
            restoreFormState: {
                value: false
            },

            /**
             * The selected location
             *
             * @attribute selectedLocation
             * @type Object
             */
            selectedLocation: {},
        }
    });
});
