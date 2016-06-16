<?php
/**
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 */
namespace EzSystems\EzContentOnTheFlyBundle\DependencyInjection;

use eZ\Bundle\EzPublishCoreBundle\DependencyInjection\Configuration\SiteAccessAware\ConfigurationProcessor;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\Yaml\Yaml;
use Symfony\Component\Config\Resource\FileResource;
use Symfony\Component\HttpKernel\DependencyInjection\Extension;
use Symfony\Component\DependencyInjection\Extension\PrependExtensionInterface;
use Symfony\Component\DependencyInjection\Loader;

class ContentOnTheFlyExtension extends Extension implements PrependExtensionInterface
{
    public function load(array $configs, ContainerBuilder $container)
    {
        $configuration = new Configuration();

        $loader = new Loader\YamlFileLoader($container, new FileLocator(__DIR__ . '/../Resources/config'));
        $loader->load('parameters.yml');
        $loader->load('services.yml');
        $loader->load('default_settings.yml');

        $config = $this->processConfiguration($configuration, $configs);

        $processor = new ConfigurationProcessor($container, 'content_on_the_fly');
        $processor->mapConfigArray('content', $config);
    }

    public function prepend(ContainerBuilder $container)
    {
        $container->prependExtensionConfig('assetic', array('bundles' => array('ContentOnTheFlyBundle')));

        $this->prependYui($container);
        $this->prependCss($container);
    }

    private function prependYui(ContainerBuilder $container)
    {
        // Directory where public resources are stored (relative to web/ directory).
        $container->setParameter('ezcontentonthefly.public_dir', 'bundles/contentonthefly');
        $yuiConfigFile = __DIR__ . '/../Resources/config/yui.yml';
        $config = Yaml::parse(file_get_contents($yuiConfigFile));
        $container->prependExtensionConfig('ez_platformui', $config);
        $container->addResource(new FileResource($yuiConfigFile));
    }

    private function prependCss(ContainerBuilder $container)
    {
        $cssConfigFile = __DIR__ . '/../Resources/config/css.yml';
        $config = Yaml::parse(file_get_contents($cssConfigFile));
        $container->prependExtensionConfig('ez_platformui', $config);
        $container->addResource(new FileResource($cssConfigFile));
    }
}
