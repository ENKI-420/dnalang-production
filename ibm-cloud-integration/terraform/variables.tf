variable "ibmcloud_api_key" {
  description = "IBM Cloud API key"
  type        = string
}

variable "region" {
  description = "IBM Cloud region"
  type        = string
  default     = "us-south"
}

variable "prefix" {
  description = "Resource prefix"
  type        = string
  default     = "dnalang"
}

variable "resource_group" {
  description = "Resource group name"
  type        = string
  default     = "Default"
}

variable "public_vlan_id" {
  description = "Public VLAN ID"
  type        = string
}

variable "private_vlan_id" {
  description = "Private VLAN ID"
  type        = string
}
