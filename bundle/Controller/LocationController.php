<?php
/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\EzContentOnTheFlyBundle\Controller;

use eZ\Publish\API\Repository\ContentService;
use eZ\Publish\API\Repository\ContentTypeService;
use eZ\Publish\API\Repository\Repository;
use eZ\Publish\Core\Base\Exceptions\UnauthorizedException;
use eZ\Publish\Core\Base\Exceptions\NotFoundException;
use eZ\Publish\API\Repository\LocationService;
use eZ\Publish\Core\REST\Server\Controller;
use eZ\Publish\Core\REST\Server\Values;
use Psr\Log\LoggerInterface;
use Psr\Log\LoggerAwareTrait;
use Symfony\Component\HttpFoundation\Request;

class LocationController extends Controller
{
    use LoggerAwareTrait;

    protected $locationService;

    protected $contentTypeService;

    protected $contentService;

    protected $contentConfiguration;

    public function __construct(
        Repository $repository,
        LocationService $locationService,
        ContentTypeService $contentTypeService,
        ContentService $contentService)
    {
        $this->repository = $repository;
        $this->locationService = $locationService;
        $this->contentTypeService = $contentTypeService;
        $this->contentService = $contentService;
    }

    public function suggestedAction(Request $request, $content)
    {
        if (!isset($this->contentConfiguration[$content]) && $content != 'default') {
            $content = 'default';
        }

        if (isset($this->contentConfiguration[$content])) {
            $locations = $this->contentConfiguration[$content]['location'];
        } else {
            $locations = [];
        }

        $contentType = $this->contentTypeService->loadContentTypeByIdentifier($content);
        $contentCreateStruct = $this->contentService->newContentCreateStruct($contentType, 'eng-GB');

        $suggested = [];
        foreach ($locations as $locationId) {
            try {
                $location = $this->locationService->loadLocation($locationId);

                $canUser = $this->repository->canUser('content', 'create', $contentCreateStruct, $location);

                if ($canUser) {
                    $suggested[] = new Values\RestLocation(
                        $location,
                        $this->locationService->getLocationChildCount($location)
                    );
                }
            } catch (UnauthorizedException $e) {
                // Skip locations user is not authorized to use
            } catch (NotFoundException $e) {
                // Skip and log invalid locations
                if ($this->logger) {
                    $this->logger->warning("Suggested location not found (content type: {$content}, location id: {$locationId}). Exception: " . $e->getMessage());
                }
            }
        }

        return new Values\LocationList($suggested, $request->getPathInfo());
    }

    public function setContentConfiguration(array $contentConfiguration)
    {
        $this->contentConfiguration = $contentConfiguration;
    }
}
