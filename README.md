# content-on-the-fly
Platform UI Content on the Fly feature

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
