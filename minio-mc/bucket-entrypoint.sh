#!/bin/sh

# extract environment variables from Docker secrets
ACCESS_KEY=$(cat $MINIO_ROOT_USER)
SECRET_KEY=$(cat $MINIO_ROOT_PASSWORD)
ALIAS="myminio"

# if either variable is empty, exit with error
if [ -z "$ACCESS_KEY" ] || [ -z "$SECRET_KEY" ]; then
		echo "Error: MINIO_ROOT_USER or MINIO_ROOT_PASSWORD is not set."
		exit 1
fi

# set MinIO alias
mc alias set $ALIAS ${MINIO_ENDPOINT} "${ACCESS_KEY}" "${SECRET_KEY}"

# ==========================================
# Configure Bucket: app-temp
# ==========================================
# use -p (ignore-existing / Idempotent)
TEMP_BUCKET="app-temp"
mc mb -p $ALIAS/$TEMP_BUCKET
mc anonymous set private $ALIAS/$TEMP_BUCKET

# --- check ILM Rule (Expire 1 Day) ---
# get rules in JSON format
RULES_TEMP=$(mc ilm rule ls --json $ALIAS/$TEMP_BUCKET | tr -d ' \n\r')

# Regex Pattern:
# \"Expiration\":\{\"Days\":1\}  -> find Expiration with Days:1
# ,\"ID\":\"[^\"]*\"             -> followed by ,ID:"(anything except quote)"
# ,\"Status\":\"Enabled\"        -> followed by ,Status:"Enabled"
TARGET_PATTERN='\"Expiration\":\{\"Days\":1\},\"ID\":\"[^\"]*\",\"Status\":\"Enabled\"'

# check if pattern exists in the rules
if [[ $RULES_TEMP =~ $TARGET_PATTERN ]]; then
    echo "ℹ️  Rule (Expire 1 Day) matches pattern. Skipping."
else
    echo "✚ Rule not found or pattern mismatch. Creating..."
    mc ilm rule add --expire-days 1 $ALIAS/$TEMP_BUCKET
fi

# ==========================================
# Configure Bucket: app-storage
# ==========================================
# use -p (ignore-existing / Idempotent)
STORAGE_BUCKET="app-storage"
mc mb -p $ALIAS/$STORAGE_BUCKET
mc anonymous set download $ALIAS/$STORAGE_BUCKET

# --- check Versioning ---
VERSION_STATUS=$(mc version info --json $ALIAS/$STORAGE_BUCKET)
if [[ $VERSION_STATUS == *"enabled"* ]]; then
    echo "ℹ️  Versioning is ALREADY ENABLED. Skipping."
else
    echo "✚ Enabling Versioning..."
    mc version enable $ALIAS/$STORAGE_BUCKET
fi

# --- check ILM Rule (Noncurrent Expire 30 Days) ---
RULES_STORAGE=$(mc ilm rule ls --json $ALIAS/$STORAGE_BUCKET | tr -d ' \n\r')

# Regex Pattern:
# '\"Expiration\":\{\"ExpiredObjectDeleteMarker\":true\} 			-> check ExpiredObjectDeleteMarker = true
# ,\"ID\":\"[^\"]*\"                                 					-> followed by ,ID:"(anything except quote)"
# ,\"NoncurrentVersionExpiration\":\{\"NoncurrentDays\":30\} 	-> followed by ,NoncurrentVersionExpiration with NoncurrentDays:30
# ,\"Status\":\"Enabled\"																			-> followed by ,Status:"Enabled"
STORAGE_PATTERN='\"Expiration\":\{\"ExpiredObjectDeleteMarker\":true\},\"ID\":\"[^\"]*\",\"NoncurrentVersionExpiration\":\{\"NoncurrentDays\":30\},\"Status\":\"Enabled\"'

if [[ $RULES_STORAGE =~ $STORAGE_PATTERN ]]; then
    echo "ℹ️  Rule (Noncurrent Expire 30 days + Del Marker) for 'app-storage' ALREADY EXISTS. Skipping."
else
    echo "✚ Rule mismatch or not found. Creating..."
    mc ilm rule add --noncurrent-expire-days 30 --expire-delete-marker $ALIAS/$STORAGE_BUCKET
fi


# ==========================================
echo "--- Configuration Complete. ---"
echo "For debugging, keeping the container alive by uncommenting the next line."
# exec tail -f /dev/null

exit 0
