# Storage Behavior

## Purpose
This document explains how private case documents are stored and served in the v1 portal.

## Storage model
- The app uses a storage abstraction.
- v1 ships with a local filesystem driver.
- The active driver is selected through environment variables.

## Local driver behavior
- `STORAGE_DRIVER=local` enables the local filesystem driver.
- `STORAGE_LOCAL_ROOT` defines the storage root directory.
- The default local storage root is `./storage`.
- Files are written under the configured storage root, not inside `public/`.

## Privacy and access
- Uploaded files are never exposed as static public files.
- Downloads always go through permission-checked routes.
- Staff users can access only their own case documents.
- Officers and admins can access documents through the protected review workflow.

## Document metadata
For each uploaded version, the portal records:
- original filename
- upload timestamp
- file size
- storage key
- current-version status
- document review state

## Versioning
- Previous document versions are preserved.
- One version is marked as current for each document record.
- Later uploads move the current-version marker without deleting prior history.

## Validation
- Allowed extensions come from `ALLOWED_UPLOAD_EXTENSIONS`.
- Maximum file size comes from upload settings with environment-based fallback.
- Validation currently checks filename extension and size.

## Operational notes
- The local filesystem driver is suitable for reliable local use and single-host evaluation.
- For future hosted environments, the storage abstraction should be backed by persistent shared storage rather than local instance disk.
- Backup, retention, and malware scanning are not implemented in v1.
