<?php
/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\EzContentOnTheFlyBundle;

use EzSystems\EzContentOnTheFlyBundle\DependencyInjection\ContentOnTheFlyExtension;
use Symfony\Component\HttpKernel\Bundle\Bundle;

class EzSystemsEzContentOnTheFlyBundle extends Bundle
{
    protected $name = 'ContentOnTheFlyBundle';

    /**
     * {@inheritdoc}
     */
    public function getContainerExtension()
    {
        return new ContentOnTheFlyExtension();
    }
}
