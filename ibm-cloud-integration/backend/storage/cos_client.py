"""IBM Cloud Object Storage Client for DNALang"""

import json
import hashlib
from typing import Dict, List, Optional, Any, BinaryIO
from datetime import datetime, timedelta
import io

import ibm_boto3
from ibm_botocore.client import Config, ClientError

from ..config import settings


class COSClient:
    """IBM Cloud Object Storage client for organism persistence"""

    def __init__(self):
        """Initialize COS client"""
        self.cos = None
        self.bucket_name = settings.COS_BUCKET_NAME

        if settings.COS_API_KEY_ID and settings.COS_SERVICE_INSTANCE_ID:
            self._initialize_cos()

    def _initialize_cos(self):
        """Initialize IBM COS connection"""
        try:
            self.cos = ibm_boto3.resource(
                "s3",
                ibm_api_key_id=settings.COS_API_KEY_ID,
                ibm_service_instance_id=settings.COS_SERVICE_INSTANCE_ID,
                config=Config(signature_version="oauth"),
                endpoint_url=settings.COS_ENDPOINT
            )

            # Verify bucket exists or create it
            self._ensure_bucket_exists()

        except Exception as e:
            print(f"COS initialization failed: {e}")
            self.cos = None

    def _ensure_bucket_exists(self):
        """Ensure the bucket exists, create if not"""
        try:
            self.cos.meta.client.head_bucket(Bucket=self.bucket_name)
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                # Create bucket
                self.cos.Bucket(self.bucket_name).create(
                    CreateBucketConfiguration={
                        'LocationConstraint': 'us-south'
                    }
                )
                print(f"Created bucket: {self.bucket_name}")

    def upload_organism(
        self,
        organism_id: str,
        organism_data: Dict[str, Any],
        metadata: Optional[Dict[str, str]] = None
    ) -> bool:
        """Upload organism to COS"""
        if not self.cos:
            return False

        try:
            # Serialize organism data
            json_data = json.dumps(organism_data, indent=2)

            # Generate key
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            key = f"organisms/{organism_id}/{timestamp}.json"

            # Prepare metadata
            object_metadata = {
                'organism_id': organism_id,
                'upload_timestamp': datetime.now().isoformat(),
                'data_hash': hashlib.sha256(json_data.encode()).hexdigest()
            }

            if metadata:
                object_metadata.update(metadata)

            # Upload to COS
            self.cos.Object(self.bucket_name, key).put(
                Body=json_data,
                Metadata=object_metadata,
                ContentType='application/json'
            )

            # Create latest pointer
            self._update_latest_pointer(organism_id, key)

            return True

        except Exception as e:
            print(f"Upload failed: {e}")
            return False

    def _update_latest_pointer(self, organism_id: str, latest_key: str):
        """Update pointer to latest version"""
        try:
            pointer_key = f"organisms/{organism_id}/latest"
            self.cos.Object(self.bucket_name, pointer_key).put(
                Body=latest_key,
                ContentType='text/plain'
            )
        except Exception:
            pass

    def download_organism(
        self,
        organism_id: str,
        version: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Download organism from COS"""
        if not self.cos:
            return None

        try:
            if version:
                key = f"organisms/{organism_id}/{version}.json"
            else:
                # Get latest version
                pointer_key = f"organisms/{organism_id}/latest"
                response = self.cos.Object(self.bucket_name, pointer_key).get()
                key = response['Body'].read().decode('utf-8')

            # Download organism data
            response = self.cos.Object(self.bucket_name, key).get()
            organism_data = json.loads(response['Body'].read())

            # Add metadata
            organism_data['_metadata'] = {
                'downloaded_at': datetime.now().isoformat(),
                'version_key': key,
                'cos_metadata': response.get('Metadata', {})
            }

            return organism_data

        except Exception as e:
            print(f"Download failed: {e}")
            return None

    def list_organisms(
        self,
        prefix: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """List organisms in COS"""
        if not self.cos:
            return []

        try:
            # List objects with prefix
            prefix = prefix or "organisms/"
            response = self.cos.meta.client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix,
                MaxKeys=limit
            )

            organisms = []
            for obj in response.get('Contents', []):
                # Skip pointer files
                if obj['Key'].endswith('/latest'):
                    continue

                organisms.append({
                    'key': obj['Key'],
                    'size': obj['Size'],
                    'last_modified': obj['LastModified'].isoformat(),
                    'etag': obj['ETag']
                })

            return organisms

        except Exception as e:
            print(f"List failed: {e}")
            return []

    def delete_organism(
        self,
        organism_id: str,
        version: Optional[str] = None
    ) -> bool:
        """Delete organism from COS"""
        if not self.cos:
            return False

        try:
            if version:
                # Delete specific version
                key = f"organisms/{organism_id}/{version}.json"
                self.cos.Object(self.bucket_name, key).delete()
            else:
                # Delete all versions
                prefix = f"organisms/{organism_id}/"
                bucket = self.cos.Bucket(self.bucket_name)
                bucket.objects.filter(Prefix=prefix).delete()

            return True

        except Exception as e:
            print(f"Delete failed: {e}")
            return False

    def upload_circuit(
        self,
        circuit_id: str,
        circuit_qasm: str,
        metadata: Optional[Dict[str, str]] = None
    ) -> bool:
        """Upload quantum circuit to COS"""
        if not self.cos:
            return False

        try:
            key = f"circuits/{circuit_id}.qasm"

            object_metadata = {
                'circuit_id': circuit_id,
                'upload_timestamp': datetime.now().isoformat()
            }

            if metadata:
                object_metadata.update(metadata)

            self.cos.Object(self.bucket_name, key).put(
                Body=circuit_qasm,
                Metadata=object_metadata,
                ContentType='text/plain'
            )

            return True

        except Exception as e:
            print(f"Circuit upload failed: {e}")
            return False

    def download_circuit(self, circuit_id: str) -> Optional[str]:
        """Download quantum circuit from COS"""
        if not self.cos:
            return None

        try:
            key = f"circuits/{circuit_id}.qasm"
            response = self.cos.Object(self.bucket_name, key).get()
            return response['Body'].read().decode('utf-8')

        except Exception as e:
            print(f"Circuit download failed: {e}")
            return None

    def upload_results(
        self,
        job_id: str,
        results: Dict[str, Any]
    ) -> bool:
        """Upload quantum execution results"""
        if not self.cos:
            return False

        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            key = f"results/{job_id}/{timestamp}.json"

            self.cos.Object(self.bucket_name, key).put(
                Body=json.dumps(results, indent=2),
                ContentType='application/json',
                Metadata={
                    'job_id': job_id,
                    'organism_id': results.get('organism_id', ''),
                    'backend': results.get('backend', ''),
                    'phi': str(results.get('phi', 0)),
                    'fitness': str(results.get('fitness', 0))
                }
            )

            return True

        except Exception as e:
            print(f"Results upload failed: {e}")
            return False

    def get_presigned_url(
        self,
        key: str,
        expiration: int = 3600
    ) -> Optional[str]:
        """Generate presigned URL for direct access"""
        if not self.cos:
            return None

        try:
            url = self.cos.meta.client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': key},
                ExpiresIn=expiration
            )
            return url

        except Exception as e:
            print(f"Presigned URL generation failed: {e}")
            return None

    def create_backup(
        self,
        backup_name: str,
        organisms: List[Dict[str, Any]]
    ) -> bool:
        """Create backup of multiple organisms"""
        if not self.cos:
            return False

        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            key = f"backups/{backup_name}_{timestamp}.json"

            backup_data = {
                'backup_name': backup_name,
                'timestamp': datetime.now().isoformat(),
                'organism_count': len(organisms),
                'organisms': organisms
            }

            self.cos.Object(self.bucket_name, key).put(
                Body=json.dumps(backup_data, indent=2),
                ContentType='application/json',
                Metadata={
                    'backup_name': backup_name,
                    'organism_count': str(len(organisms))
                }
            )

            return True

        except Exception as e:
            print(f"Backup failed: {e}")
            return False

    def restore_backup(self, backup_name: str) -> Optional[List[Dict[str, Any]]]:
        """Restore organisms from backup"""
        if not self.cos:
            return None

        try:
            # Find latest backup with name
            prefix = f"backups/{backup_name}_"
            response = self.cos.meta.client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )

            if not response.get('Contents'):
                return None

            # Get most recent backup
            latest = max(response['Contents'], key=lambda x: x['LastModified'])
            key = latest['Key']

            # Download backup
            response = self.cos.Object(self.bucket_name, key).get()
            backup_data = json.loads(response['Body'].read())

            return backup_data.get('organisms', [])

        except Exception as e:
            print(f"Restore failed: {e}")
            return None

    def get_storage_stats(self) -> Dict[str, Any]:
        """Get storage statistics"""
        if not self.cos:
            return {'error': 'COS not initialized'}

        try:
            # Get bucket size and object count
            total_size = 0
            object_count = 0

            paginator = self.cos.meta.client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(Bucket=self.bucket_name)

            for page in page_iterator:
                if 'Contents' in page:
                    object_count += len(page['Contents'])
                    total_size += sum(obj['Size'] for obj in page['Contents'])

            return {
                'bucket_name': self.bucket_name,
                'total_objects': object_count,
                'total_size_bytes': total_size,
                'total_size_mb': round(total_size / (1024 * 1024), 2),
                'endpoint': settings.COS_ENDPOINT
            }

        except Exception as e:
            return {'error': str(e)}

    def cleanup_old_versions(
        self,
        days_to_keep: int = 30
    ) -> int:
        """Clean up old organism versions"""
        if not self.cos:
            return 0

        try:
            cutoff_date = datetime.now() - timedelta(days=days_to_keep)
            deleted_count = 0

            # List all organism versions
            response = self.cos.meta.client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix="organisms/"
            )

            for obj in response.get('Contents', []):
                # Skip latest pointers
                if obj['Key'].endswith('/latest'):
                    continue

                # Check if older than cutoff
                if obj['LastModified'].replace(tzinfo=None) < cutoff_date:
                    self.cos.Object(self.bucket_name, obj['Key']).delete()
                    deleted_count += 1

            return deleted_count

        except Exception as e:
            print(f"Cleanup failed: {e}")
            return 0