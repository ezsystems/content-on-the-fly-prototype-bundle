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
        CLASS_INDEX_FORCED = 'cof-index-forced',
        CLASS_ACTIVE = 'cof-is-active',
        CLASS_CONTENT_CREACTION = 'cof-content-creation',
        CLASS_TOOLTIP = CLASS_CONTENT_CREACTION + '__tooltip',
        CLASS_BUTTON = 'cof-btn',
        CLASS_BUTTON_DISABLED = CLASS_BUTTON + '--disabled',
        CLASS_BUTTON_SUGGESTED = CLASS_BUTTON + '--select',
        CLASS_ON_PAGE_TWO = 'on-page-two',
        CLASS_SUGGESTED_LOCATIONS_ITEM = CLASS_CONTENT_CREACTION + '__suggested-locations__item',
        CLASS_SUGGESTED_LOCATIONS_HIDDEN = CLASS_CONTENT_CREACTION + '__suggested-locations--is-hidden',
        SELECTOR_CONTENT_CREACTION = '.' + CLASS_CONTENT_CREACTION,
        SELECTOR_BUTTON = '.' + CLASS_BUTTON,
        SELECTOR_NEXT_BUTTON = SELECTOR_BUTTON + '--next',
        SELECTOR_BACK_BUTTON = SELECTOR_BUTTON + '--back',
        SELECTOR_FINISH_BUTTON = SELECTOR_BUTTON + '--finish',
        SELECTOR_SUGGESTED_BUTTON = SELECTOR_BUTTON + '--select',
        SELECTOR_CONTENT_TYPE =SELECTOR_CONTENT_CREACTION +  '__content-type-selector',
        SELECTOR_CHANGE_CONTENT_TYPE = SELECTOR_BUTTON + '--change-content-type',
        SELECTOR_ITEM_SELECTED = '.ez-selection-filter-item-selected',
        SELECTOR_SUGGESTED_LOCATIONS = SELECTOR_CONTENT_CREACTION + '__suggested-locations',
        SELECTOR_SUGGESTED_ITEM = SELECTOR_SUGGESTED_LOCATIONS + '__item',
        SELECTOR_UDW_CONTAINER = '.ez-universaldiscovery-container',
        ATTR_DESCRIPTION = 'data-description',
        ATTR_ID = 'data-id',
        SELECTOR_EDIT_LOCATION_BUTTON = SELECTOR_BUTTON +  '--edit-location',
        SELECTOR_LOCATION = SELECTOR_CONTENT_CREACTION + '__location',
        SELECTOR_LOCATION_TITLE = SELECTOR_LOCATION + '__title',
        SELECTOR_CONTENT_CREATOR = SELECTOR_CONTENT_CREACTION + '__creator',
        ATTR_ACTION = 'data-action',
        SELECTOR_ACTION = '[' + ATTR_ACTION + ']',
        TEXT_PUBLISH = 'publish',
        EVENTS = {};

    EVENTS[SELECTOR_NEXT_BUTTON] = {'tap': '_changeFormPage'};
    EVENTS[SELECTOR_BACK_BUTTON] = {'tap': '_changeFormPage'};
    EVENTS[SELECTOR_FINISH_BUTTON] = {'tap': '_renderCreateContent'};
    EVENTS[SELECTOR_CHANGE_CONTENT_TYPE] = {'tap': '_changeFormPage'};
    EVENTS[SELECTOR_EDIT_LOCATION_BUTTON] = {'tap': '_openDiscoveryWidget'};
    EVENTS[SELECTOR_SUGGESTED_BUTTON] = {'tap': '_toggleSuggestedLocations'};
    EVENTS[SELECTOR_SUGGESTED_ITEM] = {'tap': '_selectSuggestedLocations'};

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
            /**
             * The click outside suggested locations event handler
             *
             * @property _clickOutsideSuggestedLocationsHandler
             * @protected
             */
            this._clickOutsideSuggestedLocationsHandler = null;

            this.on('displayedChange', this._getContentTypes, this);
            this.on('contentTypeGroupsChange', this._renderContentTypeSelector, this);
            this.on('contentTypeGroupsChange', this._preselectContentType, this);
            this.on('*:itemSelected', this._enableNextButton, this);
            this.on('*:itemSelected', this._toggleTooltip, this);
            this.on('selectedLocationChange', this._updateSelectedLocation, this);
            this.on('*:contentLoaded', this._hideCreateContentView, this, true);
            this.on('*:closeView', this._hideCreateContentView, this, false);
            this.on('suggestedLocationsChange', this._setDefaultLocation, this);
            this.on('suggestedLocationsChange', this._renderSuggestedLocations, this);
            this.on('contentTypeIdentifierChange', this._goToSecondPage, this);

            this.get('contentTypeSelectorView').on('selectedContentTypeChange', this._fetchSuggestedLocations, this);
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
            var container = this.get('container');

            container.removeClass(CLASS_LOADING);
            container.one(SELECTOR_FINISH_BUTTON).removeClass(CLASS_BUTTON_DISABLED);
        },

        /**
         * Gets the Content Types
         *
         * @protected
         * @method _getContentTypes
         * @param event {Object} event facade
         */
        _getContentTypes: function (event) {
            var displayed = event.newVal,
                container = this.get('container'),
                contentTypeContainer = container.one(SELECTOR_CONTENT_TYPE),
                nextButton = container.one(SELECTOR_NEXT_BUTTON),
                restoreFormState = this.get('restoreFormState');

            if (!displayed && !restoreFormState) {
                this._resetFormState();

                return;
            } else if (displayed && restoreFormState) {
                this.set('restoreFormState', false);

                return;
            } else if (restoreFormState || this.get('fetchContentTypesPrevented')) {
                return;
            }

            this.get('contentTypeSelectorView').hideTooltip();

            if (contentTypeContainer && nextButton) {
                contentTypeContainer.addClass(CLASS_LOADING);
                nextButton.addClass(CLASS_BUTTON_DISABLED);
            }

            /**
             * Fetches the content types data.
             * Listened in the cof.Plugin.createContentSelectContentType
             *
             * @event fetchContentTypes
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
                contentTypeSelectorView = this.get('contentTypeSelectorView'),
                tooltip = document.createElement('div');

            tooltip.classList.add(CLASS_TOOLTIP);
            tooltip.classList.add(CLASS_HIDDEN);

            contentTypeSelectorView.set('contentTypeGroups', event.newVal);

            selectorContainer.append(contentTypeSelectorView.render().get('container').append(tooltip));
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
             * @event saveDiscoveryState
             */
            this.fire('saveDiscoveryState');
            /**
             * Fired to open new Discovery Widget.
             * Listened in the cof.Plugin.selectContentType
             *
             * @event openUniversalDiscoveryWidget
             */
            this.fire('openUniversalDiscoveryWidget');

            this.set('fetchContentTypesPrevented', true);
        },

        /**
         * Updates the selected location to creating content.
         *
         * @protected
         * @method _updateSelectedLocation
         * @param event {Object} event facade
         */
        _updateSelectedLocation: function (event) {
            var container = this.get('container'),
                selectedLocation = event.newVal,
                locationPath = selectedLocation.location.get('path'),
                contentInfo = selectedLocation.contentInfo,
                selectedName = contentInfo.get('name'),
                pathSeparator = '/',
                selectedPath = pathSeparator;

            locationPath.forEach(function (location) {
                selectedPath += location.get('contentInfo').get('name') + pathSeparator;
            });

            selectedPath += selectedName;

            container.one(SELECTOR_LOCATION).setHTML(selectedPath);
            container.one(SELECTOR_LOCATION_TITLE).addClass(CLASS_ACTIVE);

            /**
             * Fired to set selected location where place the new content.
             * Listened in the eZS.Plugin.UniversalDiscoveryWidgetService
             *
             * @event setParentLocation
             * @param selectedLocation {Object} the selected location
             */
            this.fire('setParentLocation', {selectedLocation: selectedLocation.location});

            this._enableFinishButton();

            this.set('fetchContentTypesPrevented', false);
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

            if (this.get('redirectionPrevented')) {
                /**
                 * Fired to create a new content of a given type
                 *
                 * @event createContent
                 * @param contentType {eZ.ContentType} content type
                 */
                this.fire('createContent', {
                    contentType: contentTypeSelector.get('selectedContentType')
                });

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
            createContentView.after('versionChange', this._setContentLanguage.bind(this, createContentView));
            Y.one(SELECTOR_UDW_CONTAINER).addClass(CLASS_INDEX_FORCED);

            this._hideButtons(createContentView);
        },

        /**
         * Updates the content language.
         *
         * @protected
         * @method _setContentLanguage
         * @param createContentView {Object} the view instance
         * @param event {Object} event facade
         */
        _setContentLanguage: function (createContentView, event) {
            this.get('contentTypeSelectorView')
                .set('languageCode', createContentView.get('languageCode'));
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
            Y.one(SELECTOR_UDW_CONTAINER).removeClass(CLASS_INDEX_FORCED);

            if (hideWidget) {
                this.set('displayed', false);
            }
        },

        /**
         * Tries to get a list of suggested locations by firing an event.
         *
         * @protected
         * @method _fetchSuggestedLocations
         * @param event {Object} event facade
         */
        _fetchSuggestedLocations: function (event) {
            /**
             * Fired to fetch a list of suggested locations.
             * Listened in the cof.Plugin.CreateContentUniversalDiscovery
             *
             * @event fetchSuggestedLocations
             * @param event {eZ.ContentType} the seleceted content type
             */
            this.fire('fetchSuggestedLocations', event);

            this.get('container').one(SELECTOR_SUGGESTED_BUTTON).addClass(CLASS_LOADING);
        },

        /**
         * Sets the default selected location.
         *
         * @protected
         * @method _setDefaultLocation
         * @param event {Object} event facade
         */
        _setDefaultLocation: function (event) {
            var defaultLocation = event.newVal[0];

            this.set('selectedLocation', {
                location: defaultLocation,
                contentInfo: defaultLocation.get('contentInfo')
            });
        },

        /**
         * Render the suggested locations list.
         *
         * @protected
         * @method _renderSuggestedLocations
         * @param event {Object} event facade
         */
        _renderSuggestedLocations: function (event) {
            var locations = event.newVal,
                suggestedList = this.get('container').one(SELECTOR_SUGGESTED_LOCATIONS),
                itemTemplate = this.get('suggestedItemTemplate'),
                documentFragment = Y.one(document.createDocumentFragment()),
                pathSeparator = '/',
                endLongPath = '...',
                insidePathSeparator = pathSeparator + endLongPath + pathSeparator,
                maxPathLength = 40,
                minVisibleCharsNumber = 3,
                renderedItem;

            locations.forEach(function (location) {
                var locationPath = location.get('path'),
                    locationName = location.get('contentInfo').get('name'),
                    shortPath = pathSeparator,
                    longPath = pathSeparator,
                    availableCharsCount,
                    substringEndIndex;

                if (locationPath.length) {
                    longPath = locationPath.reduce(function (path, location) {
                        return path + location.get('contentInfo').get('name') + pathSeparator;
                    }, '');
                }

                if (locationPath.length >= minVisibleCharsNumber) {
                    shortPath =  [
                        locationPath[0].get('contentInfo').get('name'),
                        insidePathSeparator,
                        locationPath[locationPath.length - 1].get('contentInfo').get('name'),
                        pathSeparator
                    ].join('');
                } else {
                    shortPath = longPath;
                }

                longPath += locationName;

                if (shortPath.length + locationName.length > maxPathLength) {
                    availableCharsCount = maxPathLength - shortPath.length;

                    substringEndIndex = availableCharsCount > minVisibleCharsNumber ? availableCharsCount : minVisibleCharsNumber;

                    shortPath += locationName.substring(0, substringEndIndex) + endLongPath;
                } else {
                    shortPath += locationName;
                }


                renderedItem = Y.Template.Micro.compile(itemTemplate);
                renderedItem = renderedItem({id: location.get('id'), longPath: longPath, shortPath: shortPath});

                documentFragment.append(renderedItem);
            });

            suggestedList.setHTML(documentFragment);

            this.get('container').one(SELECTOR_SUGGESTED_BUTTON).removeClass(CLASS_LOADING);
        },

        /**
         * Toggles the visibility of suggested locations list
         *
         * @protected
         * @method _toggleSuggestedLocations
         * @param event {Object} event facade
         */
        _toggleSuggestedLocations: function (event) {
            var showList = event ? event.target.hasClass(CLASS_BUTTON_SUGGESTED) : false,
                methodName = showList ? 'removeClass' : 'addClass';

            if (event && event.target.hasClass(CLASS_LOADING)) {
                return;
            }

            this.get('container').one(SELECTOR_SUGGESTED_LOCATIONS)[methodName](CLASS_SUGGESTED_LOCATIONS_HIDDEN);

            if (showList) {
                this._clickOutsideSuggestedLocationsHandler = this.get('container')
                                                                  .one(SELECTOR_SUGGESTED_LOCATIONS)
                                                                  .on('clickoutside', this._toggleSuggestedLocations, this);
            } else {
                this._clickOutsideSuggestedLocationsHandler.detach();
            }
        },

        /**
         * Sets selected location from suggested list.
         *
         * @protected
         * @method _selectSuggestedLocations
         * @param event {Object} event facade
         */
        _selectSuggestedLocations: function (event) {
            var selectedLocationId = event.currentTarget.getAttribute(ATTR_ID),
                selectedLocation = this.get('suggestedLocations').filter(function (location) {
                    return selectedLocationId === location.get('id');
                })[0];

            this.set('selectedLocation', {location: selectedLocation, contentInfo: selectedLocation.get('contentInfo')});

            this._toggleSuggestedLocations();
        },

        /**
         * Changes page when the content type is preselected.
         *
         * @method _goToSecondPage
         * @protected
         * @param event {Object} event facade
         */
        _goToSecondPage: function (event) {
            if (!event.newVal) {
                return;
            }

            this.get('container').addClass(CLASS_LOADING);

            this.set('activePage', 0);
            this._changeFormPage();
        },

        /**
         * Sets the preselected content type.
         *
         * @method _preselectContentType
         * @protected
         * @param event {Object} event facade
         */
        _preselectContentType: function (event) {
            var preselectedContentType = this.get('contentTypeIdentifier'),
                contentTypeGroups = event.newVal,
                contentTypeSelector = this.get('contentTypeSelectorView');

            contentTypeGroups.forEach(Y.bind(function (contentTypeGroup) {
                contentTypeGroup.get('contentTypes').forEach(Y.bind(function (contentType) {
                    if (preselectedContentType === contentType.get('identifier')) {
                        contentTypeSelector.set('selectedContentType', contentType);

                        this._enableNextButton({text: contentType.get('names')[contentType.get('mainLanguageCode')]});

                        /**
                         * Fired to prepare content model for content type.
                         * Listened in the eZS.Plugin.SelectCreateContent
                         *
                         * @event prepareContentModel
                         * @param contentType {eZ.ContentType} the content type model
                         */
                        contentTypeSelector.fire('prepareContentModel', {contentType: contentType});
                    }
                }, this));
            }, this));
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

            /**
             * The suggested locations list
             *
             * @attribute suggestedLocations
             * @type Array
             */
            suggestedLocations: {},

            /**
             * The suggested loction item template
             *
             * @attribute suggestedItemTemplate
             * @type String
             */
            suggestedItemTemplate: {
                value: '<li class="' + CLASS_SUGGESTED_LOCATIONS_ITEM + '" data-id="<%= data.id %>"><abbr title=" <%= data.longPath %> "><%= data.shortPath %></abbr></li>'
            },

            /**
             * Should prevent from closing discovery widget?
             *
             * @attribute closingDiscoveryWidgetPrevented
             * @type Boolean
             * @default true
             */
            closingDiscoveryWidgetPrevented: {
                value: true
            },

            /**
             * Should redirect to create content?
             *
             * @attribute redirectionPrevented
             * @type Boolean
             * @default false
             */
            redirectionPrevented: {
                value: false
            },

            /**
             * Should prevent from getting content types?
             *
             * @attribute fetchContentTypesPrevented
             * @type Boolean
             * @default false
             */
            fetchContentTypesPrevented: {
                value: false
            },
        }
    });
});
