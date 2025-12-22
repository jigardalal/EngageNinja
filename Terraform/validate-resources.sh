#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

REGION="${1:-us-east-1}"

echo "Validating AWS resource presence in ${REGION}..."

if ! command -v aws >/dev/null 2>&1; then
  echo "aws CLI not found; install and configure it before running this script" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required (https://stedolan.github.io/jq/) to parse responses" >&2
  exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text --region "${REGION}")

queue_names=(
  "engageninja-outbound-messages-dev"
  "engageninja-sms-events-dev"
  "engageninja-email-events-dev"
  "engageninja-outbound-messages-dlq-dev"
)

for queue_name in "${queue_names[@]}"; do
  echo "- Checking SQS queue ${queue_name}"
  queue_url=$(aws sqs get-queue-url --queue-name "${queue_name}" --output text --region "${REGION}")
  aws sqs get-queue-attributes \
    --queue-url "${queue_url}" \
    --attribute-names ApproximateNumberOfMessages ApproximateNumberOfMessagesNotVisible \
    --region "${REGION}" \
    | jq -r --arg name "${queue_name}" '. as $attrs | {QueueName: $name, Attributes: $attrs.Attributes}'
done

topic_names=(
  "engageninja-sms-events-dev"
  "engageninja-email-events-dev"
)

for topic_name in "${topic_names[@]}"; do
  topic_arn="arn:aws:sns:${REGION}:${ACCOUNT_ID}:${topic_name}"
  echo "- Checking SNS topic ${topic_name}"
  aws sns get-topic-attributes \
    --topic-arn "${topic_arn}" \
    --region "${REGION}" \
    | jq -r --arg name "${topic_name}" '{Topic: $name, Attributes: .Attributes}'
done

echo "- Checking SES configuration set"
aws ses describe-configuration-set \
  --configuration-set-name engageninja-email-events \
  --region "${REGION}" \
  | jq -r '{ConfigurationSet: .ConfigurationSet.Name, SendingEnabled: .ConfigurationSet.SendingEnabled}'

echo "Validation complete."
