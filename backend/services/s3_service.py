import boto3
import os
from botocore.exceptions import ClientError
from datetime import datetime, timedelta
import uuid

class S3Service:
    def __init__(self):
        self.bucket_name = os.getenv("AWS_S3_BUCKET", "walkquest-proofs")
        self.region = os.getenv("S3_REGION", "us-east-1")
        
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=self.region
        )
    
    def generate_presigned_upload_url(self, proof_id: str) -> dict:
        """Generate a presigned URL for uploading proof images."""
        try:
            # Generate unique object key
            timestamp = datetime.utcnow().strftime("%Y/%m/%d")
            object_key = f"proofs/{timestamp}/{proof_id}.jpg"
            
            # Generate presigned URL (expires in 1 hour)
            presigned_url = self.s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': object_key,
                    'ContentType': 'image/jpeg'
                },
                ExpiresIn=3600  # 1 hour
            )
            
            # Construct the final image URL
            image_url = f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{object_key}"
            
            return {
                "method": "PUT",
                "url": presigned_url,
                "headers": {"Content-Type": "image/jpeg"},
                "image_url": image_url
            }
            
        except ClientError as e:
            raise Exception(f"Failed to generate presigned URL: {str(e)}")
    
    def get_image_url(self, proof_id: str) -> str:
        """Get the public URL for a proof image."""
        timestamp = datetime.utcnow().strftime("%Y/%m/%d")
        object_key = f"proofs/{timestamp}/{proof_id}.jpg"
        return f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{object_key}"
