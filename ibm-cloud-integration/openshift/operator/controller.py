#!/usr/bin/env python3
"""DNALang Kubernetes Operator Controller"""

import os
import asyncio
import logging
from typing import Dict, Any
from kubernetes import client, config, watch
from kubernetes.client.rest import ApiException

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

LAMBDA_PHI = 2.176435e-8

class OrganismController:
    def __init__(self):
        try:
            config.load_incluster_config()
        except:
            config.load_kube_config()
        
        self.v1 = client.CoreV1Api()
        self.apps_v1 = client.AppsV1Api()
        self.autoscaling_v1 = client.AutoscalingV1Api()
        self.custom_api = client.CustomObjectsApi()
        
    async def watch_organisms(self):
        """Watch for Organism CRD changes"""
        w = watch.Watch()
        
        for event in w.stream(
            self.custom_api.list_cluster_custom_object,
            group="dnalang.io",
            version="v1",
            plural="organisms"
        ):
            event_type = event['type']
            organism = event['object']
            
            if event_type in ['ADDED', 'MODIFIED']:
                await self.reconcile_organism(organism)
            elif event_type == 'DELETED':
                await self.cleanup_organism(organism)
                
    async def reconcile_organism(self, organism: Dict[str, Any]):
        """Reconcile organism state"""
        metadata = organism['metadata']
        spec = organism['spec']
        name = metadata['name']
        namespace = metadata.get('namespace', 'default')
        
        logger.info(f"Reconciling organism {name} in namespace {namespace}")
        
        # Create deployment for organism
        deployment = self.create_deployment(name, namespace, spec)
        
        try:
            self.apps_v1.create_namespaced_deployment(
                namespace=namespace,
                body=deployment
            )
            logger.info(f"Created deployment for {name}")
        except ApiException as e:
            if e.status == 409:  # Already exists
                self.apps_v1.patch_namespaced_deployment(
                    name=name,
                    namespace=namespace,
                    body=deployment
                )
                logger.info(f"Updated deployment for {name}")
            else:
                raise
                
        # Create autoscaler if enabled
        if spec.get('autoscale', {}).get('enabled', False):
            await self.create_autoscaler(name, namespace, spec['autoscale'])
            
        # Update organism status
        await self.update_organism_status(organism)
        
    def create_deployment(self, name: str, namespace: str, spec: Dict) -> Dict:
        """Create deployment specification"""
        return {
            "apiVersion": "apps/v1",
            "kind": "Deployment",
            "metadata": {
                "name": name,
                "namespace": namespace,
                "labels": {"organism": name}
            },
            "spec": {
                "replicas": spec.get('replicas', 1),
                "selector": {"matchLabels": {"organism": name}},
                "template": {
                    "metadata": {"labels": {"organism": name}},
                    "spec": {
                        "containers": [{
                            "name": "organism",
                            "image": "dnalang/organism:latest",
                            "env": [
                                {"name": "ORGANISM_NAME", "value": name},
                                {"name": "DNA_CODE", "value": spec.get('dnaCode', '')},
                                {"name": "BACKEND", "value": spec.get('backend', 'ibm_torino')},
                                {"name": "LAMBDA_PHI", "value": str(LAMBDA_PHI)}
                            ],
                            "resources": {
                                "requests": {"memory": "256Mi", "cpu": "100m"},
                                "limits": {"memory": "512Mi", "cpu": "500m"}
                            }
                        }]
                    }
                }
            }
        }
        
    async def create_autoscaler(self, name: str, namespace: str, autoscale: Dict):
        """Create horizontal pod autoscaler"""
        hpa = {
            "apiVersion": "autoscaling/v2",
            "kind": "HorizontalPodAutoscaler",
            "metadata": {"name": name, "namespace": namespace},
            "spec": {
                "scaleTargetRef": {
                    "apiVersion": "apps/v1",
                    "kind": "Deployment",
                    "name": name
                },
                "minReplicas": autoscale.get('minReplicas', 1),
                "maxReplicas": autoscale.get('maxReplicas', 10),
                "metrics": [
                    {
                        "type": "Pods",
                        "pods": {
                            "metric": {"name": "phi_consciousness"},
                            "target": {
                                "type": "AverageValue",
                                "averageValue": str(autoscale.get('targetPhi', 0.5))
                            }
                        }
                    }
                ]
            }
        }
        
        try:
            self.autoscaling_v1.create_namespaced_horizontal_pod_autoscaler(
                namespace=namespace,
                body=hpa
            )
        except ApiException as e:
            if e.status != 409:  # Ignore if already exists
                raise
                
    async def update_organism_status(self, organism: Dict):
        """Update organism CRD status"""
        # In production, this would fetch actual metrics from pods
        status = {
            "phase": "Running",
            "fitness": 0.75,
            "phi": 0.65,
            "lambda": LAMBDA_PHI * 1e8,
            "gamma": 1.2,
            "generation": 1,
            "lastExecuted": "2024-01-01T00:00:00Z"
        }
        
        try:
            self.custom_api.patch_namespaced_custom_object_status(
                group="dnalang.io",
                version="v1",
                namespace=organism['metadata'].get('namespace', 'default'),
                plural="organisms",
                name=organism['metadata']['name'],
                body={"status": status}
            )
        except Exception as e:
            logger.error(f"Failed to update status: {e}")
            
    async def cleanup_organism(self, organism: Dict):
        """Clean up organism resources"""
        name = organism['metadata']['name']
        namespace = organism['metadata'].get('namespace', 'default')
        
        try:
            self.apps_v1.delete_namespaced_deployment(
                name=name,
                namespace=namespace
            )
            logger.info(f"Deleted deployment for {name}")
        except ApiException:
            pass
            
    async def run(self):
        """Run the controller"""
        logger.info("Starting DNALang Operator Controller")
        while True:
            try:
                await self.watch_organisms()
            except Exception as e:
                logger.error(f"Controller error: {e}")
                await asyncio.sleep(5)

if __name__ == "__main__":
    controller = OrganismController()
    asyncio.run(controller.run())
