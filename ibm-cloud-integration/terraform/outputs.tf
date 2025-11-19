output "vpc_id" {
  value = ibm_is_vpc.dnalang_vpc.id
}

output "subnet_id" {
  value = ibm_is_subnet.dnalang_subnet.id
}

output "cluster_id" {
  value = ibm_container_cluster.dnalang_cluster.id
}

output "cos_bucket" {
  value = ibm_cos_bucket.dnalang_bucket.bucket_name
}

output "service_id" {
  value = ibm_iam_service_id.dnalang_service.id
}
