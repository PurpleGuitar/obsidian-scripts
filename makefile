# This file is intended to be run from your Obsidian vault root directory, e.g.:
# make -f /path/to/obsidian-scripts/makefile <target>
# or by symlinking this makefile into your vault root directory.

# Ensure OBSIDIAN_BACKUP_DIR is defined.
# This should be the path to your backup directory.
ifndef OBSIDIAN_BACKUP_DIR
$(error OBSIDIAN_BACKUP_DIR is not set, please set it to your backup directory)
endif

.PHONY: backup
backup:
	tar czfv \
		$(OBSIDIAN_BACKUP_DIR)/$(notdir $(CURDIR))-backup-$$(date +"%Y-%m-%d_%H-%M-%S").tar.gz \
		--exclude='.obsidian' \
		--exclude='.trash' \
		.
