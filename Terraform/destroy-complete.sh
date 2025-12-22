#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

# Environment overrides
AWS_REGION="${AWS_REGION:-us-east-1}"
SES_CONFIGURATION_SET="${SES_CONFIGURATION_SET_NAME:-engageninja-email-events}"

echo "Destroying Terraform-managed infrastructure..."
terraform destroy -auto-approve

echo "Deleting SES configuration set (${SES_CONFIGURATION_SET})..."
aws ses delete-configuration-set \
  --configuration-set-name "${SES_CONFIGURATION_SET}" \
  --region "${AWS_REGION}" \
  >/dev/null 2>&1 || true

echo "Cleanup complete."
