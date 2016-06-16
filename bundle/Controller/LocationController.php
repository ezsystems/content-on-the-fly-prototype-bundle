<?php
/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\EzContentOnTheFlyBundle\Controller;

use eZ\Publish\API\Repository\LocationService;
use eZ\Publish\Core\REST\Server\Controller;
use eZ\Publish\Core\REST\Server\Values;
use Symfony\Component\HttpFoundation\Request;

class LocationController extends Controller
{
    protected $locationService;

    protected $configuration;

    public function __construct(LocationService $locationService)
    {
        $this->locationService = $locationService;
    }

    public function suggestedAction(Request $request, $content)
    {
        if (!isset($this->configuration[$content]) && $content != 'default') {
            $content = 'default';
        }

        if (isset($this->configuration[$content])) {
            $locations = $this->configuration[$content]['location'];
        } else {
            $locations = [];
        }

        $suggested = [];
        foreach ($locations as $locationId) {
            $location = $this->locationService->loadLocation($locationId);
            $suggested[] = new Values\RestLocation(
                $location,
                $this->locationService->getLocationChildCount($location)
            );
        }

        return new Values\LocationList($suggested, $request->getPathInfo());
    }

    public function setConfiguration(array $configuration)
    {
        $this->configuration = $configuration;
    }
}
