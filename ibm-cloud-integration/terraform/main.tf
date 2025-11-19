terraform {
  required_providers {
    ibm = {
      source = "IBM-Cloud/ibm"
      version = "~> 1.60.0"
    }
  }
}

provider "ibm" {
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = var.region
}

# VPC
resource "ibm_is_vpc" "dnalang_vpc" {
  name = "${var.prefix}-vpc"
  resource_group = data.ibm_resource_group.group.id
}

# Subnet
resource "ibm_is_subnet" "dnalang_subnet" {
  name            = "${var.prefix}-subnet"
  vpc             = ibm_is_vpc.dnalang_vpc.id
  zone            = "${var.region}-1"
  ipv4_cidr_block = "10.240.0.0/24"
}

# OpenShift Cluster
resource "ibm_container_cluster" "dnalang_cluster" {
  name              = "${var.prefix}-cluster"
  datacenter        = "${var.region}-1"
  machine_type      = "bx2.4x16"
  hardware          = "shared"
  public_vlan_id    = var.public_vlan_id
  private_vlan_id   = var.private_vlan_id
  
  default_pool_size = 3
  
  labels = {
    app = "dnalang"
    quantum = "enabled"
  }
}

# Cloud Object Storage
resource "ibm_cos_bucket" "dnalang_bucket" {
  bucket_name          = "${var.prefix}-organisms"
  resource_instance_id = ibm_resource_instance.cos.id
  region_location      = var.region
  storage_class        = "smart"
  
  lifecycle_rule {
    id      = "cleanup-old"
    status  = "enable"
    expiration {
      days = 90
    }
  }
}

resource "ibm_resource_instance" "cos" {
  name              = "${var.prefix}-cos"
  service           = "cloud-object-storage"
  plan              = "standard"
  location          = "global"
  resource_group_id = data.ibm_resource_group.group.id
}

# IAM
resource "ibm_iam_service_id" "dnalang_service" {
  name = "${var.prefix}-service"
}

resource "ibm_iam_service_policy" "policy" {
  iam_service_id = ibm_iam_service_id.dnalang_service.id
  roles          = ["Writer", "Reader"]
  
  resources {
    service = "cloud-object-storage"
    resource_instance_id = ibm_resource_instance.cos.guid
  }
}

data "ibm_resource_group" "group" {
  name = var.resource_group
}

output "cluster_endpoint" {
  value = ibm_container_cluster.dnalang_cluster.public_service_endpoint_url
}

output "cos_endpoint" {
  value = "https://s3.${var.region}.cloud-object-storage.appdomain.cloud"
}
