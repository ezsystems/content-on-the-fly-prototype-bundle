# content-on-the-fly
Platform UI Content on the Fly feature

## Install

1. Install via `composer require "ezsystems/content-on-the-fly-prototype ^0.1.0"`
2. Enable by adding `new EzSystems\EzContentOnTheFlyBundle\EzSystemsEzContentOnTheFlyBundle()` to `app/AppKernel.php`.
3. Clear cache and setup assets with `composer run-script post-update-cmd`
  - *If you use prod env make sure that is set with `export SYMFONY_ENV=prod` first.*

## Configuration
Example application configuration (`app/config/config.yml`):
```yml
# ...

content_on_the_fly:
    system:
        site:                       # Configuration per SiteAccess
            content:
                article:            # Content identifier
                    location:
                        - 2         # Suggested location(s)
                default:            # Default, in case of unconfigured content identifier
                    location:
                        - 2
                        - 43
```

Default bundle configuration:
```yml
parameters:
    content_on_the_fly.default.content:
        image:
            location:
                - 51    # /Media/Images
        default:
            location:
                - 2     # /Home
                - 43    # /Media
```
