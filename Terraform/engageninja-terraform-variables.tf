# ============================================================================
# Core Variables
# ============================================================================

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "engageninja"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

# ============================================================================
# SQS Configuration Variables
# ============================================================================

variable "sqs_message_retention_seconds" {
  description = "SQS message retention in seconds"
  type        = number
  default     = 1209600
}

variable "sqs_visibility_timeout_seconds" {
  description = "SQS visibility timeout in seconds"
  type        = number
  default     = 300
}

# ============================================================================
# CloudWatch Configuration Variables
# ============================================================================

variable "cloudwatch_logs_retention_days" {
  description = "CloudWatch Logs retention in days"
  type        = number
  default     = 30
}

variable "enable_cloudwatch_logs" {
  description = "Enable CloudWatch Logs"
  type        = bool
  default     = true
}

# ============================================================================
# SNS Configuration Variables
# ============================================================================

variable "sns_retry_policy_max_receive_count" {
  description = "SNS message delivery retry policy (number of retries)"
  type        = number
  default     = 3
}

variable "tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}

# ============================================================================
# IAM Configuration Variables
# ============================================================================

variable "iam_user_name" {
  description = "IAM user name"
  type        = string
  default     = "engageninja-app"
}

# ============================================================================
# Log Configuration Variables
# ============================================================================

variable "log_retention_days" {
  description = "Log retention in days"
  type        = number
  default     = 30
}

# ============================================================================
# SES Configuration Variables
# ============================================================================

variable "ses_configuration_set_name" {
  description = "SES Configuration Set name"
  type        = string
  default     = "engageninja-email-events"
}
