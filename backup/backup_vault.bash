#!/usr/bin/env bash

# # To Install
#
# Make sure to set the `VAULT_NAME` variable in the script for this vault, e.g. "reference" or "personal".
#
# To run it on start, create a new Startup Applications entry for it and use a command line like the following:
#
# ```bash
# VAULT_NAME=reference BACKUP_DIR=/home/craig/Dropbox/Craig/obsidian-reference-backup bash -c '/home/craig/Documents/Reference/Scripts/backup/backup_vault.bash'
# ```


# Parameter: Vault Name
if [ -z "$VAULT_NAME" ]; then
    echo "Please set \$VAULT_NAME, e.g."
    echo "export VAULT_NAME=personal"
    return
fi

# Parameter: Backup directory
if [ -z "$BACKUP_DIR" ]; then
    echo "Please set \$BACKUP_DIR, e.g."
    echo "export BACKUP_DIR=/home/backup/obsidian-vaults"
    return
fi

# Backup filename
BACKUP_FILENAME=obsidian-$VAULT_NAME-backup-$(date +'%Y-%m-%d_%H-%M-%S').tar.gz

# Get directory of this script
# Source: https://stackoverflow.com/a/246128
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
    DIR="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"
    SOURCE="$(readlink "$SOURCE")"
    [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
SOURCE_DIR="$( cd -P "$( dirname "$SOURCE" )" >/dev/null 2>&1 && pwd )"

# Tar up a backup of the vault, starting at the grandparent of this script's dir
tar cvfz $BACKUP_DIR/$BACKUP_FILENAME $SOURCE_DIR/../../*
