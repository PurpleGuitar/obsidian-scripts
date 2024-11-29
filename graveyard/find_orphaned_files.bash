: <<'END_COMMENT'

This file is both an executable Bash script and also a valid Markdown file. 

Given the starting directory of your vault, this will look for any files that aren't referred to by any other file.  Works with images, PDFs, canvases, etc.

It's slow, especially for large vaults, but it works.

# To Run

```bash
bash ./find_orphaned_files.bash
```

# Source code

```bash
END_COMMENT

# DEBUG: uncomment to show bash commands while running
# set -x

START_DIRECTORY=".."

IGNORE_DIRECTORIES=(
	".obsidian"
	"Inbox"
	"Archive"
)

# Set IFS to match files with spaces, and remember old value
SAVED_IFS=${IFS}
IFS=$(echo -en "\n\b")

# Loop over all files in the starting directory
for FILE in $(find ${START_DIRECTORY})
do

# Ignore anything in the IGNORE_DIRECTORIES list
SKIP_DIR=
for IGNORE_DIR in ${IGNORE_DIRECTORIES[@]}
do
	if [[ ${FILE} = *"/${IGNORE_DIR}/"* ]]; then
		SKIP_DIR=1
		break
	fi
done
if [[ ${SKIP_DIR} -eq 1 ]]; then
	# echo "Ignoring: ${FILE}"
	continue
fi

# Skip directories
if [[ -d ${FILE} ]]; then
	# echo "Skipping directory: ${FILE}"
	continue 
fi

# Get the base name, e.g. Topic.md
BASENAME=$(basename ${FILE})

# Get the page name, e.g. Topic
PAGENAME=${BASENAME%.*}

# Search for references to this file.  Using -q means that no output will be
# generated.  The error code will be 0 if something was found, 1 if not.
grep -orq --exclude-dir='.obsidian' "${PAGENAME}" "${START_DIRECTORY}"

# Report if no matches
if [ $? -eq 1 ]; then
   echo "${FILE}: found no references"
fi

done

# Restore old IFS for file matching
IFS=${SAVED_IFS}

: <<'END_COMMENT'
```
vim: filetype=bash
END_COMMENT
