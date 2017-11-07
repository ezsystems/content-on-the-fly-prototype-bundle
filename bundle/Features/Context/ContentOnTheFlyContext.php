<?php
/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\EzContentOnTheFlyBundle\Features\Context;

use Behat\Behat\Context\Context;
use Behat\Behat\Hook\Scope\BeforeScenarioScope;

class ContentOnTheFlyContext implements Context
{
    /** @var \EzSystems\FlexWorkflowBundle\Features\Context\FlexWf */
    private $flexWfContext;

    /** @var \EzSystems\EzContentOnTheFlyBundle\Features\Context\ContentOnTheFlyPopup */
    private $contentOnTheFly;

    /** @BeforeScenario
     * @param BeforeScenarioScope $scope Behat scope
     */
    public function getFlexWfContext(BeforeScenarioScope $scope)
    {
        $environment = $scope->getEnvironment();
        $this->flexWfContext = $environment->getContext('EzSystems\FlexWorkflowBundle\Features\Context\FlexWf');
    }

    /**
     * @Given I start creating content from the Dashboard
     *
     * Click the "Create" button when ot the Dashboard
     */
    public function startCreatingContentFromDashboard()
    {
        $parentSelector = ContentOnTheFlyPopup::getParentSelector('Dashboard');
        $this->contentOnTheFly = new ContentOnTheFlyPopup($this->flexWfContext, $parentSelector);
        $this->flexWfContext->clickElementByText('CREATE', 'button');
    }

    /**
     * @Given I start creating content from the Universal Discovery widget
     *
     * Switches to embedded Content On The Fly window when UDW is open
     */
    public function startCreatingContentFromUDW()
    {
        $parentSelector = ContentOnTheFlyPopup::getParentSelector('UDW');
        $this->contentOnTheFly = new ContentOnTheFlyPopup($this->flexWfContext, $parentSelector);
        $this->flexWfContext->switchContentBrowserTab('Create');
    }

    /**
     * @Given I create :contentType from :contentGroup group in :location location
     *
     * Selects Content Type and location (if available - from Suggested locations) in open Content On The Fly Popup
     *
     * @param string $contentGroup Name of the Content Group to which Content Type belongs
     * @param string $contentType Name of the Content Type
     * @param string $location Location of the content
     */
    public function createNewContentInLocation($contentGroup, $contentType, $location)
    {
        $this->chooseContentType($contentGroup, $contentType);
        if (in_array($location, $this->contentOnTheFly->displayedSuggestedLocations)) {
            $this->selectFromSuggestedLocation($location);
        } else {
            $this->selectLocation($location);
        }
        $this->finishConfiguration();
    }

    /**
     * @Given I select :contentType from the :contentGroup group
     *
     * Selects given Content Type (checks Content Group if needed)
     *
     * @param string $contentGroup Name of the Content Group to which Content Type belongs
     * @param string $contentType Name of the Content Type
     */
    public function chooseContentType($contentGroup, $contentType)
    {
        $this->contentOnTheFly->chooseContentType($contentGroup, $contentType);
        $this->contentOnTheFly->clickButton('next');
    }

    /**
     * @Given I select :location from Suggested Locations
     *
     * Select a location from available suggested Locations
     *
     * @param string $location Location to select
     */
    public function selectFromSuggestedLocation($location)
    {
        $this->contentOnTheFly->selectSuggestedLocation($location);
    }

    /**
     * @Given I change Content Type to :contentType from :contentGroup group
     *
     * Undo selecting a Content Type and select another one
     *
     * @param string $contentGroup Name of the Content Group to which Content Type belongs
     * @param string $contentType Name of the Content Type to select
     */
    public function changeContentType($contentGroup, $contentType)
    {
        $this->contentOnTheFly->removeContentType();
        $this->contentOnTheFly->chooseContentType($contentGroup, $contentType);
        $this->contentOnTheFly->clickButton('next');
    }

    /**
     * @Given I select :location location
     *
     * Select given location using UDW
     *
     * @param string $location Location to select
     */
    public function selectLocation($location)
    {
        $this->contentOnTheFly->selectLocation($location);
    }

    /**
     * @Given I finish configuration
     *
     * Clicks "Finish" button
     */
    public function finishConfiguration()
    {
        $this->contentOnTheFly->waitUntilSelectedLocationIsDisplayed($this->contentOnTheFly->selectedLocation);
        $this->contentOnTheFly->clickButton('finish');
    }
}
