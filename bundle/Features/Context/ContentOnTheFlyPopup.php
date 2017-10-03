<?php
/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\EzContentOnTheFlyBundle\Features\Context;

use EzSystems\StudioUIBundle\Features\Context\StudioUI;
use InvalidArgumentException;
use PHPUnit\Framework\Assert;

class ContentOnTheFlyPopup
{
    /** @var array Displayed suggested locations in Content on the fly popup */
    public $displayedSuggestedLocations = ['/Media', '/Home'];

    /** @var string Location selected by the user (defaults to /Home) */
    public $selectedLocation = '/Home';

    /** @var \EzSystems\StudioUIBundle\Features\Context\StudioUI main context */
    private $context;

    /** @var string Main selector in which Content on the fly is embedded */
    private $mainSelector = '.ez-view-contentcreationview';

    /** @var string Text of button to select location */
    private $selectLocationText = 'Select Location';

    /** @var string Selector to get displayed location */
    private $displayedLocationSelector = '.cof-content-creation__location';

    /** @var string Selector for dropdown item with suggested locations */
    private $suggestedLocationsListSelector = '.cof-content-creation__suggested-locations__item';

    /** @var string General selector for buttons in the popup */
    private $buttonSelector = '.cof-btn';

    /** @var string Selector of button to remove Content Type */
    private $changeContentTypeButton = '.cof-btn--change-content-type';

    /** @var string Variable to store selected Content Type */
    private $selectedContentType;

    /** @var string[] Array of available parent location of Content on the fly popup and their selectors */
    private static $parentLocations = [
        'Dashboard' => '.ez-view-dashboardblocksview',
        'UDW' => '.ez-view-universaldiscoveryview',
    ];

    /**
     * @param \EzSystems\StudioUIBundle\Features\Context\StudioUI $context
     * @param string $parentSelector Selector of the element contaning Content Of The Fly in it
     */
    public function __construct(StudioUI $context, $parentSelector)
    {
        $this->context = $context;
        $this->mainSelector = sprintf('%s %s', $parentSelector, $this->mainSelector);
        $this->context->waitWhileLoading();
    }

    /**
     * Content on the fly can be embedded in different DOM nodes. Returns selector to interact with the correct one.
     *
     * @param string $parentLocation Location from which Content On The Fly is invoked
     *
     * @throws InvalidArgumentException If unknown parent location is given
     *
     * @return string Parent selector of the invoked Content On The Fly popup
     */
    public static function getParentSelector($parentLocation)
    {
        if (!array_key_exists($parentLocation, self::$parentLocations)) {
            throw new InvalidArgumentException('Unsupported parent location: ' . $parentLocation);
        }

        return self::$parentLocations[$parentLocation];
    }

    /**
     * Selects the Content type from given Content Group. Selects the Content group if needed.
     *
     * @param string $contentGroup Name of the Content Group
     * @param string $contentType Name of the Content Type
     */
    public function chooseContentType($contentGroup, $contentType)
    {
        $element = $this->context->getElementByText($contentGroup, '.ez-contenttypeselector-group');

        if (!$this->context->findWithWait('.ez-contenttypeselector-group-checkbox', $element)->isChecked()) {
            $element->click();
        }

        $this->context->clickElementByText($contentType, '.ez-selection-filter-item');
        $this->selectedContentType = $contentType;
    }

    /**
     * Clicks the button in content on the fly button.
     *
     * @param string $button Button to click: next, finish or select
     */
    public function clickButton($button)
    {
        $this->context->clickElementByClass(sprintf('%s %s--%s', $this->mainSelector, $this->buttonSelector, $button));
    }

    /**
     * Selects a location from suggested locations dropdown.
     *
     * @param string $location Location to select from suggested locations
     */
    public function selectSuggestedLocation($location)
    {
        $this->context->spin(function () {
            return $this->areSuggestedLocationsLoaded();
        });
        $this->clickButton('select');
        $this->context->clickElementByText($location, $this->suggestedLocationsListSelector);

        $this->waitUntilSelectedLocationIsDisplayed($location);
        $this->selectedLocation = $location;
    }

    /**
     * Verifies whether suggested locations have been loaded correctly.
     *
     * @return bool
     */
    public function areSuggestedLocationsLoaded()
    {
        return count($this->displayedSuggestedLocations) === count($this->context->findAllWithWait($this->suggestedLocationsListSelector));
    }

    /**
     * Select locations using Universal Discovery Widget.
     *
     * @param string $location Location to select from UDW
     */
    public function selectLocation($location)
    {
        $this->context->clickElementByText($this->selectLocationText, $this->buttonSelector);
        $this->context->selectFromUniversalDiscovery($location);
        $this->context->clickChooseContentPopUp('Confirm selection');
        $this->context->waitWhileLoading();

        $this->waitUntilSelectedLocationIsDisplayed($location);
        $this->selectedLocation = $location;
    }

    /**
     * Removes the selected Content Type.
     */
    public function removeContentType()
    {
        $selectedContentType = $this->context->getElementByClass(sprintf('%s %s', $this->mainSelector, $this->changeContentTypeButton));
        Assert::assertSame($this->selectedContentType, $selectedContentType->getText());
        $selectedContentType->click();
    }

    /**
     * Gets displayed selected location.
     *
     * @return string Displayed selected location
     */
    public function getDisplayedSelectedLocation()
    {
        return $this->context->findWithWait(sprintf('%s %s', $this->mainSelector, $this->displayedLocationSelector))->getText();
    }

    /**
     * Waits until the displayed location is the same as set by the user.
     *
     * @param string $location Expected selected location
     */
    public function waitUntilSelectedLocationIsDisplayed($location)
    {
        $location = substr($location, 0, 1) === '/' ? $location : sprintf('/%s', $location);
        $this->context->spin(
            function () use ($location) {
                return  $this->getDisplayedSelectedLocation() === $location;
            }
        );
    }
}
