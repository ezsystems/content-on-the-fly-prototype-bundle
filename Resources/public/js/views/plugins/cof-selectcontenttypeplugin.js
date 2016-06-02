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
        },
    }, {
        NS: 'selectContentType'
    });

    Y.eZ.PluginRegistry.registerPlugin(
        Y.cof.Plugin.SelectContentType, ['universalDiscoveryViewService']
    );
});
