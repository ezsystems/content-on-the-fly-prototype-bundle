#!/bin/sh

set -e

if [ "$1" = "" ]; then
    echo "Argument 1 variable for behat arguments is empty, please pass arguments"
    exit 1
fi

cd $HOME/build/ezplatform

# Execute test command, need to use sh to get right exit code (docker/compose/issues/3379)
CMD=\"$@\"
docker-compose exec -T --user www-data app bash -c \""$CMD"\"
