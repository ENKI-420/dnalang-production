#!/usr/bin/env python3
"""
AURA Memory Indexer - DNA-Lang Codebase Intelligence System
ΛΦ = 2.176435 × 10⁻⁸ s⁻¹

This script indexes the entire codebase into Supabase's vector database,
giving AURA the ability to "know" and understand its own code structure.
"""

import os
import glob
from typing import List
from dotenv import load_dotenv
from supabase import create_client, Client
from openai import OpenAI

# Load Environment Variables
load_dotenv()
if not os.getenv("NEXT_PUBLIC_SUPABASE_URL"):
    load_dotenv("../.env.local")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize Clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# Configuration
TARGET_EXTENSIONS = ['**/*.py', '**/*.ts', '**/*.tsx', '**/*.md', '**/*.sql']
IGNORE_DIRS = ['node_modules', '.next', 'venv', '__pycache__', '.git', '.vercel']

def is_ignored(file_path: str) -> bool:
    """Check if file is in ignored directories"""
    return any(ignore_dir in file_path for ignore_dir in IGNORE_DIRS)

def get_embedding(text: str) -> List[float]:
    """Generate embedding using OpenAI text-embedding-3-small"""
    text = text.replace("\n", " ")
    return openai_client.embeddings.create(
        input=[text], 
        model="text-embedding-3-small"
    ).data[0].embedding

def index_codebase(root_dir: str = "../"):
    """Index all codebase files into Supabase vector database"""
    print(f"🧬 AURA Memory Indexer Starting...")
    print(f"ΛΦ = 2.176435 × 10⁻⁸ s⁻¹\n")
    
    total_files = 0
    indexed_files = 0
    
    for ext in TARGET_EXTENSIONS:
        files = glob.glob(os.path.join(root_dir, ext), recursive=True)
        for file_path in files:
            total_files += 1
            
            if is_ignored(file_path):
                print(f"⏭️  Skipping (ignored): {file_path}")
                continue
            
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                if len(content.strip()) == 0:
                    print(f"⏭️  Skipping (empty): {file_path}")
                    continue
                
                # Truncate to 8000 chars for embedding API
                truncated_content = content[:8000]
                
                print(f"📄 Processing: {file_path} ({len(content)} chars)")
                
                # Generate embedding
                vector = get_embedding(truncated_content)
                
                # Prepare data
                data = {
                    "file_path": file_path,
                    "content": content,
                    "embedding": vector
                }
                
                # Delete existing entry if present
                supabase.table('codebase_memory').delete().eq('file_path', file_path).execute()
                
                # Insert new entry
                supabase.table('codebase_memory').insert(data).execute()
                
                indexed_files += 1
                print(f"✅ Indexed: {file_path}\n")
                
            except Exception as e:
                print(f"❌ Error processing {file_path}: {e}\n")
    
    print(f"\n🎉 Indexing Complete!")
    print(f"Total files scanned: {total_files}")
    print(f"Files indexed: {indexed_files}")
    print(f"AURA now has memory of {indexed_files} files.\n")

if __name__ == "__main__":
    index_codebase()
